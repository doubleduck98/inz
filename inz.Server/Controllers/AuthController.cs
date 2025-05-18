using inz.Server.Dtos.Auth;
using inz.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
        var res = await _auth.LoginAsync(model.Email, model.Password);
        if (res.IsFailure) return Problem(res.Error!.Message, type: res.Error!.Type, statusCode: res.Error!.Code);

        _auth.SetCookie(HttpContext.Response, res.Value.Token);
        return Ok(res.Value.User);
    }

    [HttpGet]
    [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<IActionResult> GetToken()
    {
        var userId = HttpContext.User.FindFirst("userId");
        var res = await _auth.LoginWithToken(userId!.Value);

        _auth.SetCookie(HttpContext.Response, res.Token);
        return Ok(res.User);
    }

    [HttpPost]
    public async Task<IActionResult> Refresh([FromBody] RefreshReq model)
    {
        var res = await _auth.RefreshTokenAsync(model.Token);
        if (res.IsFailure) return Problem(res.Error!.Message, statusCode: StatusCodes.Status400BadRequest);

        _auth.SetCookie(HttpContext.Response, res.Value.Token);
        return Ok(new { res.Value.RefreshToken });
    }

    [HttpPost]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Logout([FromBody] LogoutReq model)
    {
        var userId = HttpContext.User.FindFirst("Sub")?.Value ??
                     throw new AuthenticationFailureException("User id claim not found");
        var res = await _auth.InvalidateUserTokenAsync(userId, model.Token);
        return res.IsSuccess ? Ok() : BadRequest(res.Error!.Message);
    }

    [HttpPost]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Revoke()
    {
        var userId = HttpContext.User.FindFirst("Sub")?.Value ??
                     throw new AuthenticationFailureException("User id claim not found");
        await _auth.InvalidateAllUserTokensAsync(userId);
        return Ok();
    }
}