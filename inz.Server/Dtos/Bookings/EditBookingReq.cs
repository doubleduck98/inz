using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Bookings;

public record EditBookingReq(
    [Required] int PatientId,
    [Required] int RoomId
);