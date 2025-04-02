using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos;

public class LogoutReq
{
    [Required]
    public string Token { get; set; } = null!;
}