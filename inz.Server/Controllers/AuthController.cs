using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(TokenProvider tokenProvider) : ControllerBase
{
    [HttpPost]
    public IActionResult Login()
    {
        return Ok(tokenProvider.Create());
    }

    [HttpGet]
    [Authorize]
    public IActionResult Test()
    {
        return Ok("xd");
    }
}