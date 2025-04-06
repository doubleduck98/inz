using inz.Server.Dtos;
using inz.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers;

[ApiController]
[Route("[controller]/[action]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService authService)
    {
        _auth = authService;
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginReq model)
    {
        var u = await _auth.FindUserByEmailAsync(model.Email);
        if (u == null) return BadRequest($"User with email ${model.Email} doesn't exist.");

        var authenticated = await _auth.VerifyUserAsync(u, model.Password);
        if (!authenticated) return BadRequest("Wrong credentials.");

        var t = await _auth.GetAuthTokenAsync(u);
        var rt = await _auth.GetRefreshTokenAsync(u);
        return Ok(new LoginResp { Token = t, RefreshToken = rt });
    }

    [HttpPost]
    public async Task<IActionResult> Refresh([FromBody] RefreshReq model)
    {
        var res = await _auth.RefreshTokenAsync(model.Token);
        if (res.IsFailure) return BadRequest(res.Error!.Message);

        var user = await _auth.FindTokenOwnerAsync(res.Value!);
        var t = await _auth.GetAuthTokenAsync(user);
        return Ok(new RefreshResp { Token = t, RefreshToken = res.Value! });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Logout([FromBody] LogoutReq model)
    {
        var userId = HttpContext.User.FindFirst("Sub");
        var res = await _auth.InvalidateUserTokenAsync(userId!.Value, model.Token);
        return res.IsSuccess ? Ok() : BadRequest(res.Error!.Message);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Revoke()
    {
        var userId = HttpContext.User.FindFirst("Sub");
        await _auth.InvalidateAllUserTokensAsync(userId!.Value);
        return Ok();
    }
}