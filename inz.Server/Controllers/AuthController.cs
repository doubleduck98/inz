using inz.Server.Dtos;
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
        if (!authenticated) return Unauthorized("Wrong credentials.");

        var t = await _auth.GetAuthTokenAsync(u);
        var rt = await _auth.GetRefreshTokenAsync(u);
        return Ok(new LoginResp { Token = t, RefreshToken = rt });
    }

    [HttpPost]
    public async Task<IActionResult> Refresh([FromBody] RefreshReq model)
    {
        var user = await _auth.FindTokenOwnerAsync(model.Token);
        if (user == null) return BadRequest();

        var res = await _auth.RefreshTokenAsync(user, model.Token);
        if (res.IsFailure) return BadRequest(res.Error!.Message);

        var t = await _auth.GetAuthTokenAsync(user);
        return Ok(new RefreshResp { Token = t, RefreshToken = res.Value! });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        var userId = HttpContext.User.FindFirst("Sid");
        var user = await _auth.FindUserByIdAsync(userId!.Value);
        await _auth.InvalidateUserToken(user!);
        return Ok();
    }
}