using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace inz.Server;

public interface ITokenProvider
{
    public string Create();
}

public class TokenProvider(IConfiguration configuration) : ITokenProvider
{
    public string Create()
    {
        var secret = configuration["Jwt:Secret"];
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Subject = new ClaimsIdentity(
                [
                    new Claim(JwtRegisteredClaimNames.Name, "xd")
                ]
            ),
            Issuer = configuration["Jwt:Issuer"],
            Audience = configuration["Jwt:Audience"],
            Expires = DateTime.UtcNow.AddMinutes(60),
            SigningCredentials = credentials
        };
        var handler = new JsonWebTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);
        return token;
    }
}