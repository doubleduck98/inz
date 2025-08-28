using System.ComponentModel.DataAnnotations;

namespace inz.Server.ViewModels.Users;

public class LoginModel
{
    [Required(ErrorMessage = "Proszę podać email")]
    [EmailAddress(ErrorMessage = "Nieprawidłowy adres email")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać hasło")]
    public string Password { get; set; } = null!;
}