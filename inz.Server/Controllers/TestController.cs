using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers;

[ApiController]
[Route("[controller]")]
public class TestController : ControllerBase
{
    [Authorize]
    [HttpGet]
    public IActionResult Test()
    {
        return Ok();
    }
}