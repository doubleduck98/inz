using System.ComponentModel.DataAnnotations;

namespace inz.Server.ViewModels.Users;

public class ResetPasswordViewModel
{
    public string UserId { get; set; } = null!;

    [Display(Name = "Użytkownik")]
    public string? NameSurname { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać nowe hasło")]
    [DataType(DataType.Password)]
    [Display(Name = "Nowe hasło")]
    public string NewPassword { get; set; } = null!;

    [Required(ErrorMessage = "Proszę powtórzyć nowe hasło")]
    [DataType(DataType.Password)]
    [Display(Name = "Potwierdź nowe hasło")]
    [Compare("NewPassword", ErrorMessage = "Hasła nie są zgodne.")]
    public string ConfirmPassword { get; set; } = null!;
}