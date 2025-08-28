namespace inz.Server.Dtos.Mvc;

public record UserDto(
    string Id,
    string Name,
    string Surname,
    string Email,
    string? Phone
);