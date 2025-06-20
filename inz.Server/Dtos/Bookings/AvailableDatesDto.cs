namespace inz.Server.Dtos.Bookings;

public record AvailableDatesDto(
    DateOnly Date,
    List<int> Hours
);