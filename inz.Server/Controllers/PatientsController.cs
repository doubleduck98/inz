using inz.Server.Dtos.Patients;
using inz.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace inz.Server.Controllers;

[ApiController]
[Route("[controller]/[action]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class PatientsController : ApiBaseController
{
    private readonly IPatientsService _patients;

    public PatientsController([FromServices] IPatientsService patientsService)
    {
        _patients = patientsService;
    }

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

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Edit([FromBody] EditPatientReq req, int id)
    {
        var res = await _patients.EditPatient(UserId, id, req);
        return res.IsSuccess ? Ok(res.Value) : ProblemResponse(res);
    }

    [HttpPost("{id:int}")]
    public async Task<IActionResult> AddContact(int id, [FromBody] AddContactReq req)
    {
        var res = await _patients.AddContact(UserId, id, req);
        return res.IsSuccess ? Ok(res.Value) : ProblemResponse(res);
    }
}