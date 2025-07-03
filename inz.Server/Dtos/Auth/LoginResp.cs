namespace inz.Server.Dtos.Auth;

public record LoginResp(
    string Name,
    string Surname,
    string Email,
    string Token,
    string RefreshToken
);