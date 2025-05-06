namespace inz.Server.Dtos.Auth;

public record LoginResp(
    UserDto User,
    string Token
);