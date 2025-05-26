using inz.Server.Dtos.Patients;
using inz.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace inz.Server.Controllers;

[ApiController]
[Route("[controller]/[action]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class PatientsController : ControllerBase
{
    private readonly IPatientsService _patients;
    private readonly IHttpContextAccessor _contextAccessor;

    private string UserId => _contextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
                             throw new AuthenticationFailureException("User id claim not found");

    public PatientsController(
        [FromServices] IPatientsService patientsService,
        [FromServices] IHttpContextAccessor contextAccessor)
    {
        _patients = patientsService;
        _contextAccessor = contextAccessor;
    }

    private ObjectResult ProblemResponse(Result result) =>
        Problem(result.Error!.Message, type: result.Error.Type, statusCode: result.Error.Code);

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? search)
    {
        var res = search.IsNullOrEmpty()
            ? await _patients.GetPatients(UserId)
            : await _patients.SearchPatients(UserId, search!);
        return Ok(res);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var res = await _patients.GetPatientDetails(UserId, id);
        return res.IsSuccess ? Ok(res.Value) : ProblemResponse(res);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePatientReq req)
    {
        var res = await _patients.CreatePatient(UserId, req);
        return res.IsSuccess ? Created("", res.Value) : ProblemResponse(res);
    }
}