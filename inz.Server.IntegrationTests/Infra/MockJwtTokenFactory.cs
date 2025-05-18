using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

namespace inz.Server.IntegrationTests.Infra;

public static class MockJwtTokenFactory
{
    private static SigningCredentials SigningCredentials { get; }
    public static string Issuer => "https://localhost:7258";
    public static SecurityKey SecurityKey { get; }

    private static readonly JwtSecurityTokenHandler TokenHandler = new();
    private static readonly RandomNumberGenerator Rng = RandomNumberGenerator.Create();
    private static readonly byte[] Key = new byte[32];

    static MockJwtTokenFactory()
    {
        Rng.GetBytes(Key);
        SecurityKey = new SymmetricSecurityKey(Key) { KeyId = Guid.NewGuid().ToString() };
        SigningCredentials = new SigningCredentials(SecurityKey, SecurityAlgorithms.HmacSha256);
    }

    public static string GenerateJwtToken(IEnumerable<Claim> claims)
    {
        return TokenHandler.WriteToken(new JwtSecurityToken(Issuer, "http://localhost:5165", claims, null,
            DateTime.UtcNow.AddMinutes(60), SigningCredentials));
    }
}