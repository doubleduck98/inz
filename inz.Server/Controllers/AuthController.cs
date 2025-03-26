using inz.Server.Dtos;
using inz.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers;

[ApiController]
[Route("[controller]/[action]")]
public class AuthController : ControllerBase
{
    private readonly ITokenProvider _tokenProvider;
    private readonly UserManager<User> _users;

    public AuthController(ITokenProvider tokenProvider, UserManager<User> users)
    {
        _tokenProvider = tokenProvider;
        _users = users;
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginReq model)
    {
        var u = await _users.FindByEmailAsync(model.Email);
        if (u == null) return BadRequest($"User with email ${model.Email} doesn't exist.");
        
        var res = await _users.RemoveAuthenticationTokenAsync(u, "jwt", "refreshToken");
        if (!res.Succeeded) return BadRequest(res.Errors);
        
        var rt = await _users.GenerateUserTokenAsync(u, "jwt", "refreshToken");
        res = await _users.SetAuthenticationTokenAsync(u, "jwt", "refreshToken", rt);
        if (!res.Succeeded) return BadRequest(res.Errors);
        
        var t = _tokenProvider.Create();
        return Ok(new LoginResp { Token = t, RefreshToken = rt });
    }

    [HttpPost]
    public async Task<IActionResult> Refresh([FromBody] RefreshReq token)
    {
        var u = await _users.FindByNameAsync("youre beautiful");
        var valid = await _users.VerifyUserTokenAsync(u, "jwt", "refreshToken", token.Token);
        return valid ? Ok("valid") : Unauthorized("xdddd");
    }
}