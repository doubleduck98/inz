using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Bookings;

public record FreeReq(
    [Required] int RoomId,
    [Required] List<DateOnly> Dates
);