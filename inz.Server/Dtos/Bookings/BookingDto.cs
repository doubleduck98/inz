namespace inz.Server.Dtos.Bookings;

public record BookingDto(
    int Id,
    int Hour,
    DateOnly Date,
    string RoomName,
    string Patient
);