using inz.Server.Models;

namespace inz.Server.Dtos.Bookings;

public record BookingDto(
    int Id,
    int Hour,
    DateOnly Date,
    int RoomId,
    string RoomName,
    int PatientId,
    string Patient
)
{
    public BookingDto(Booking booking, Patient patient, Room room) : this(booking.Id, booking.Hour, booking.Date,
        room.Id, room.Name, patient.Id, $"{patient.Name} {patient.Surname}")
    {
    }
};