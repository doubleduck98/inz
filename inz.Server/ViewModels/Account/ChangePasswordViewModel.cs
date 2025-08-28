using System.ComponentModel.DataAnnotations;

namespace inz.Server.ViewModels.Account;

public class ChangePasswordViewModel
{
    [Required(ErrorMessage = "Proszę podać obecne hasło")]
    [DataType(DataType.Password)]
    [Display(Name = "Obecne hasło")]
    public string OldPassword { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać nowe hasło")]
    [DataType(DataType.Password)]
    [Display(Name = "Nowe hasło")]
    public string NewPassword { get; set; } = null!;

    [Required(ErrorMessage = "Proszę powtórzyć nowe hasło")]
    [DataType(DataType.Password)]
    [Display(Name = "Potwierdź nowe hasło")]
    [Compare("NewPassword", ErrorMessage = "Hasła nie są zgodne")]
    public string ConfirmPassword { get; set; } = null!;
}