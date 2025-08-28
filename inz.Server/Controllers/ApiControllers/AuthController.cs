using inz.Server.Dtos.Auth;
using inz.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers.ApiControllers;

[ApiController]
[Route("[controller]/[action]")]
public class AuthController : ApiBaseController
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
        return res.IsSuccess ? Ok(res.Value) : ProblemResponse(res);
    }

    [HttpGet]
    [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<IActionResult> GetToken()
    {
        var userId = HttpContext.User.FindFirst("userId");
        if (userId == null) throw new AuthenticationFailureException("User id claim not found");
        
        var res = await _auth.LoginWithToken(userId.Value);
        return Ok(res);
    }

    [HttpPost]
    public async Task<IActionResult> Refresh([FromBody] RefreshReq req)
    {
        var res = await _auth.RefreshTokenAsync(req.Token);
        return res.IsSuccess ? Ok(res.Value) : ProblemResponse(res);
    }

    [HttpPost]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Logout([FromBody] LogoutReq req)
    {
        var res = await _auth.InvalidateUserTokenAsync(UserId, req.Token, HttpContext);
        return res.IsSuccess ? Ok() : ProblemResponse(res);
    }

    [HttpPost]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Revoke()
    {
        await _auth.InvalidateAllUserTokensAsync(UserId);
        return Ok();
    }
}