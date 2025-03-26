namespace inz.Server.Dtos;

public class LoginResp
{
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
}