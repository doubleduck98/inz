using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Auth;

public record LogoutReq([Required] string Token);