using System.ComponentModel.DataAnnotations;

namespace inz.Server.ViewModels.Users;

public class EditUserViewModel
{
    [Required]
    public string Id { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać imię")]
    [Display(Name = "Imię")]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać nazwisko")]
    [Display(Name = "Nazwisko")]
    public string Surname { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać email")]
    [EmailAddress(ErrorMessage = "Nieprawidłowy adres email")]
    [Display(Name = "Email")]
    public string Email { get; set; } = null!;

    public string? ReturnUrl { get; set; }
}