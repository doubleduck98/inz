using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos;

public class LoginReq
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;
}