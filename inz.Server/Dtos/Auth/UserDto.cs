namespace inz.Server.Dtos.Auth;

public record UserDto(
    string Name,
    string Surname,
    string Email,
    string RefreshToken
);