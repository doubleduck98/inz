using System.ComponentModel.DataAnnotations;

namespace inz.Server.ViewModels.Users;

public class UserDetailsViewModel
{
    public string Id { get; set; } = null!;

    [Display(Name = "Imię")]
    public string Name { get; set; } = null!;

    [Display(Name = "Nazwisko")]
    public string Surname { get; set; } = null!;

    [Display(Name = "Adres Email")]
    public string Email { get; set; } = null!;

    [Display(Name = "Numer telefonu")]
    public string? PhoneNumber { get; set; }
}