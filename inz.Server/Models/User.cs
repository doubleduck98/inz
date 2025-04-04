using Microsoft.AspNetCore.Identity;

namespace inz.Server.Models;

public class User : IdentityUser
{
    public string? Name { get; set; }
    public string? Surname { get; set; }
    
    public List<RefreshToken> RefreshTokens { get; set; } = null!;
    public List<Document> Documents { get; set; } = null!;
}