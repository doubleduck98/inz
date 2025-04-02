using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using inz.Server.Models;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace inz.Server;

public interface ITokenProvider
{
    public string CreateToken(User user, IList<Claim> claims);
    public string CreateRefreshToken();
}

public class TokenProvider(IConfiguration configuration) : ITokenProvider
{
    public string CreateToken(User user, IList<Claim> claims)
    {
        var secret = configuration["Jwt:Secret"];
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var cs = claims.Concat([
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Name, user.Name!),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!)
            ]
        );
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(cs),
            Issuer = configuration["Jwt:Issuer"],
            Audience = configuration["Jwt:Audience"],
            Expires = DateTime.UtcNow.AddMinutes(60),
            SigningCredentials = credentials
        };
        var handler = new JsonWebTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);
        return token;
    }

    public string CreateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
    }
}