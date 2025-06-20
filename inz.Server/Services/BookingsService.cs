using inz.Server.Data;
using inz.Server.Dtos.Bookings;
using inz.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.Services;

public interface IBookingsService
{
    public Task<List<BookingDto>> GetBookingsForDay(string userId, DateOnly date);
    public Task<List<BookingDto>> GetBookingsForWeek(string userId, DateOnly startDate, DateOnly endDate);
    public Task<List<AvailableDatesDto>> GetAvailableDates(int roomId, List<DateOnly> dates);
    public Task<Result<List<BookingDto>>> CreateBooking(string userId, CreateBookingReq req);
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
            .Include(b => b.User)
            .Where(b => b.UserId == userId && b.Date == date)
            .Select(b => new BookingDto(b.Id, b.Hour, b.Date, b.Room.Name, $"{b.Patient.Name} {b.Patient.Surname}"))
            .ToListAsync();
    }

    public async Task<List<BookingDto>> GetBookingsForWeek(string userId, DateOnly startDate, DateOnly endDate)
    {
        return await _db.Bookings.Include(b => b.Patient)
            .Include(b => b.User)
            .Where(b => b.UserId == userId && b.Date >= startDate && b.Date <= endDate)
            .OrderBy(b => b.Date)
            .Select(b => new BookingDto(b.Id, b.Hour, b.Date, b.Room.Name, $"{b.Patient.Name} {b.Patient.Surname}"))
            .ToListAsync();
    }

    public async Task<List<AvailableDatesDto>> GetAvailableDates(int roomId, List<DateOnly> dates)
    {
        var hours = Enumerable.Range(DayStart, DayEnd - DayStart).ToList();

        // get all booked hours for given day and room
        // if a day has no bookings it won't be present in the list
        var booked = await _db.Bookings
            .Where(b => roomId == b.RoomId && dates.Contains(b.Date))
            .Select(b => new { b.Date, b.Hour })
            .ToListAsync();
        // for each requested date filter available hours
        var available = dates.Select(d =>
            new AvailableDatesDto(d, hours.Where(h => !booked.Any(b => b.Date == d && b.Hour == h)).ToList()));

        return available.ToList();
    }

    public async Task<Result<List<BookingDto>>> CreateBooking(string userId, CreateBookingReq req)
    {
        var (roomId, patientId, bookings) = req;

        var room = await _db.Rooms.SingleOrDefaultAsync(r => r.Id == roomId);
        if (room == null) return Result.Failure<List<BookingDto>>(Error.RoomNotFound);
        var patient = await _db.Patients.SingleOrDefaultAsync(p => p.Id == patientId);
        if (patient == null) return Result.Failure<List<BookingDto>>(Error.PatientNotFound);
        foreach (var (date, hour) in bookings)
        {
            var bookingExists = await _db.Bookings.AnyAsync(b => b.Date == date && b.Hour == hour);
            if (bookingExists) return Result.Failure<List<BookingDto>>(Error.BookingError(date, hour));
        }

        var user = await _db.Users.SingleAsync(u => u.Id == userId);
        var bookingEnts = bookings.Select(b => new Booking
        {
            Date = b.Date,
            Hour = b.Hour,
            User = user,
            Patient = patient,
            Room = room
        }).ToList();
        _db.Bookings.AddRange(bookingEnts);
        await _db.SaveChangesAsync();

        return bookingEnts
            .Select(b => new BookingDto(b.Id, b.Hour, b.Date, room.Name, $"{patient.Name} {patient.Surname}"))
            .ToList();
    }

    public async Task<Result> DeleteBooking(string userId, int bookingId)
    {
        var booking = await _db.Bookings.SingleOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);
        if (booking == null) return Result.Failure(Error.BookingNotFound);

        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync();
        return Result.Success();
    }
}