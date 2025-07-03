using System.Text;
using inz.Server.Data;
using inz.Server.Dtos.Bookings;
using inz.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.Services;

public interface IBookingsService
{
    public Task<List<BookingDto>> GetBookingsForDay(string userId, DateOnly date);

    public Task<Dictionary<DateOnly, List<BookingDto>>> GetBookingsForWeek(string userId, DateOnly startDate,
        DateOnly endDate);

    public Task<Dictionary<DateOnly, List<int>>> GetAvailableDates(string userId, int roomId, List<DateOnly> dates);
    public Task<List<RoomDto>> GetRooms();
    public Task<Result<List<BookingDto>>> CreateBooking(string userId, CreateBookingReq req);
    public Task<Result> EditBooking(string userId, int bookingId, EditBookingReq req);
    public Task<Result> DeleteBooking(string userId, int bookingId);
}

public class BookingService : IBookingsService
{
    private const int DayStart = 8;
    private const int DayEnd = 16;
    private readonly AppDbContext _db;

    public BookingService([FromServices] AppDbContext dbContext)
    {
        _db = dbContext;
    }

    public async Task<List<BookingDto>> GetBookingsForDay(string userId, DateOnly date)
    {
        return await _db.Bookings.Include(b => b.Patient)
            .Include(b => b.Room)
            .Where(b => b.UserId == userId && b.Date == date)
            .Select(b => new BookingDto(b, b.Patient, b.Room))
            .ToListAsync();
    }

    public async Task<Dictionary<DateOnly, List<BookingDto>>> GetBookingsForWeek(
        string userId, DateOnly startDate, DateOnly endDate)
    {
        // get stored bookings and associate them with dates *in order*
        // if a day has no bookings, it won't be present in the dict
        var bookings = await _db.Bookings.Include(b => b.Patient)
            .Include(b => b.Room)
            .Where(b => b.UserId == userId && b.Date >= startDate && b.Date <= endDate)
            .OrderBy(b => b.Date)
            .GroupBy(b => b.Date)
            .ToDictionaryAsync(
                grp => grp.Key,
                grp => grp.Select(b =>
                        new BookingDto(b, b.Patient, b.Room))
                    .ToList());

        return bookings;
    }

    public async Task<Dictionary<DateOnly, List<int>>> GetAvailableDates(
        string userId, int roomId, List<DateOnly> dates)
    {
        var hours = Enumerable.Range(DayStart, DayEnd - DayStart + 1).ToList();

        // get stored bookings and associate them with dates
        // if a day has no bookings, it won't be present in the dict
        var booked = await _db.Bookings
            // include both any bookings for requested room 
            .Where(b => (roomId == b.RoomId && dates.Contains(b.Date))
                        // and any other user's bookings for requested day
                        || (userId == b.UserId && dates.Contains(b.Date)))
            .GroupBy(b => b.Date)
            .ToDictionaryAsync(
                grp => grp.Key,
                grp => grp.Select(b => b.Hour).ToList());

        // for each requested date filter available hours
        var available = dates.ToDictionary(
            date => date,
            date => booked.TryGetValue(date, out var bookedh)
                ? hours.Where(hr => !bookedh.Contains(hr)).ToList()
                : hours);

        return available;
    }

    public async Task<List<RoomDto>> GetRooms()
    {
        return await _db.Rooms.Select(r => new RoomDto(r.Id, r.Name)).ToListAsync();
    }

    public async Task<Result<List<BookingDto>>> CreateBooking(string userId, CreateBookingReq req)
    {
        var (roomId, patientId, bookings) = req;

        var room = await _db.Rooms.SingleOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return Result.Failure<List<BookingDto>>(Error.RoomNotFound);
        var patient = await _db.Patients.SingleOrDefaultAsync(p => p.Id == patientId);
        if (patient == null) return Result.Failure<List<BookingDto>>(Error.PatientNotFound);

        // check if any collisions occur
        var (query, parameters) = ConstructDateHourClause(bookings, roomId);
#pragma warning disable EF1002
        var collisionCount = await _db.Database
            .SqlQueryRaw<int>($"SELECT COUNT(*) as \"Value\" FROM \"Bookings\" WHERE {query}", parameters)
            .SingleAsync();
        if (collisionCount > 0)
        {
            // construct error message pointing to eventual collisions
            var collisions = await _db.Bookings
                .FromSqlRaw($"SELECT \"Date\", \"Hour\" From \"Bookings\" WHERE {query}", parameters)
                .Select(b => new { b.Date, b.Hour })
                .ToListAsync();
            var errorMsgs = collisions.Select(c => $"{c.Date.ToString("O")} {c.Hour}");
            var errorMessage = new StringBuilder().AppendJoin(", ", errorMsgs).ToString();
            return Result.Failure<List<BookingDto>>(Error.BookingError(errorMessage));
        }
#pragma warning restore EF1002

        var user = await _db.Users.SingleAsync(u => u.Id == userId);
        var bookingEnts = bookings.Select(b => new Booking
        {
            Date = b.Key,
            Hour = b.Value,
            User = user,
            Patient = patient,
            Room = room
        }).ToList();
        _db.Bookings.AddRange(bookingEnts);
        await _db.SaveChangesAsync();

        return bookingEnts
            .Select(b => new BookingDto(b, b.Patient, b.Room))
            .ToList();
    }

    public async Task<Result> EditBooking(string userId, int bookingId, EditBookingReq req)
    {
        var booking = await _db.Bookings.SingleOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);
        if (booking == null) return Result.Failure<BookingDto>(Error.BookingNotFound);
        var notAvailable = await _db.Bookings.AnyAsync(b =>
            b.Date == booking.Date && b.Hour == booking.Hour && b.RoomId == req.RoomId && b.Id != booking.Id);
        if (notAvailable) return Result.Failure<BookingDto>(Error.BookingAlreadyExists);

        booking.RoomId = req.RoomId;
        booking.PatientId = req.PatientId;
        _db.Bookings.Update(booking);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> DeleteBooking(string userId, int bookingId)
    {
        var booking = await _db.Bookings.SingleOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);
        if (booking == null) return Result.Failure(Error.BookingNotFound);

        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    /// <summary>
    /// Constructs a clause for raw sql query WITH operator. 
    /// </summary>
    /// <param name="dateHours">Dictionary representing booking dates with hours.</param>
    /// <param name="roomId">Id of room entity the booking is for.</param>
    /// <returns>(string clause, object[] params) pair.</returns>
    /// <remarks>
    /// The need for this comes from EFCore not being able to translate Linq query in form
    /// `.Where(table => listOfPairs.Contains({table.ColumnA, table.ColumnB})...`. This function constructs
    /// a OR chain of parametrized clauses `columnA == pair.A AND columnB == pair.B`,
    /// that can be executed inside a raw sql query.
    /// </remarks>
    private static (string, object[]) ConstructDateHourClause(Dictionary<DateOnly, int> dateHours, int roomId)
    {
        var clauses = new List<string>();
        var parameters = new List<object>();
        var i = 0;
        foreach (var dateHour in dateHours)
        {
            clauses.Add($"(\"Date\" = @p{i} AND \"Hour\" = @p{i + 1})");
            parameters.Add(dateHour.Key);
            parameters.Add(dateHour.Value);

            i += 2;
        }

        var clause = new StringBuilder().AppendJoin(" OR ", clauses);
        clause.Append($" AND \"RoomId\" = @p{i}");
        parameters.Add(roomId);
        return (clause.ToString(), parameters.ToArray());
    }
}