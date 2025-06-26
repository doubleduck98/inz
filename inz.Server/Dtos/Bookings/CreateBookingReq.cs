using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Bookings;

public record CreateBookingReq(
    [Required] int RoomId,
    [Required] int PatientId,
    [Required] [MinLength(1)] Dictionary<DateOnly, int> Bookings
);