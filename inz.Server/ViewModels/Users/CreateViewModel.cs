using System.ComponentModel.DataAnnotations;

namespace inz.Server.ViewModels.Users;

public record CreateViewModel
{
    [Required(ErrorMessage = "Proszę podać imię")]
    [Display(Name = "Imię")]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać nazwisko")]
    [Display(Name = "Nazwisko")]
    public string Surname { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać adres email")]
    [EmailAddress(ErrorMessage = "Nieprawidłowy adres email")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać hasło")]
    [Display(Name = "Hasło")]
    public string Password { get; set; } = null!;

    [Required(ErrorMessage = "Potwierdź hasło")]
    [Compare("Password", ErrorMessage = "Hasła nie są zgodne")]
    [Display(Name = "Potwierdź hasło")]
    public string ConfirmPassword { get; set; } = null!;
}