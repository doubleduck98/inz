using System.ComponentModel.DataAnnotations;

namespace inz.Server.ViewModels;

public class LoginModel
{
    [Required(ErrorMessage = "Proszę podać email.")]
    [EmailAddress(ErrorMessage = "Proszę podać prawidłowy adres email.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać hasło.")]
    public string Password { get; set; } = null!;
}