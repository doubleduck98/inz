using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Auth;

public record RefreshReq([Required] string Token);