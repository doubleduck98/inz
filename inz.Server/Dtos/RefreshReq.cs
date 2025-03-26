using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos;

public class RefreshReq
{
    [Required]
    public string Token { get; set; } = null!;
}