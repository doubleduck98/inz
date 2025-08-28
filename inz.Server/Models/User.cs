using Microsoft.AspNetCore.Identity;

namespace inz.Server.Models;

public class User : IdentityUser
{
    public string Name { get; set; } = null!;
    public string Surname { get; set; } = null!;

    public List<RefreshToken> RefreshTokens { get; set; } = null!;
    public List<Document> Documents { get; set; } = null!;
    public List<Patient> Patients { get; set; } = null!;
    public List<Booking> Bookings { get; set; } = null!;

    public string FullName => $"{Name} {Surname}";
}