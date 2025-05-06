using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Auth;

public record LoginReq(
    [Required]
    [EmailAddress]
    string Email,
    [Required]
    string Password
);