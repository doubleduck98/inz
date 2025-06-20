using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Bookings;

public record CreateBookingReq(
    [Required] int RoomId,
    [Required] int PatientId,
    [Required] [MinLength(1)] List<BookingReq> Bookings
);

public record BookingReq(
    [Required] DateOnly Date,
    [Required] [Range(8, 16)] int Hour
);