using inz.Server.Dtos.Resources;
using inz.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace inz.Server.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[Route("[controller]/[action]")]
public class ResourcesController : ControllerBase
{
    private readonly IDocumentsService _docs;
    private readonly IHttpContextAccessor _contextAccessor;

    private string UserId => _contextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
                             throw new AuthenticationFailureException("User id claim not found");

    public ResourcesController(
        [FromServices] IDocumentsService documents,
        [FromServices] IHttpContextAccessor contextAccessor
    )
    {
        _contextAccessor = contextAccessor;
        _docs = documents;
    }

    private ObjectResult ProblemResponse(Result result) =>
        Problem(result.Error!.Message, type: result.Error.Type, statusCode: result.Error.Code);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var docs = await _docs.GetFiles(UserId);
        return Ok(docs);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Download(int id)
    {
        var res = await _docs.GetFileStream(UserId, id);
        return res.IsSuccess
            ? File(res.Value.File, "application/octet-stream", res.Value.FileName)
            : ProblemResponse(res);
    }

    [HttpGet]
    public async Task<IActionResult> Download([FromQuery] DownloadReq req)
    {
        var res = await _docs.GetFileArchive(UserId, req.Ids);
        return res.IsSuccess
            ? File(res.Value.File, "application/zip", res.Value.FileName)
            : ProblemResponse(res);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateFileReq req)
    {
        var res = await _docs.SaveDocument(UserId, req.File, req.FileName);
        return res.IsSuccess ? Created($"/{res.Value.Id}", res.Value) : ProblemResponse(res);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Edit(int id, [FromBody] EditFileReq req)
    {
        var res = await _docs.EditDocument(UserId, id, req.FileName);
        return res.IsSuccess ? Ok() : ProblemResponse(res);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var res = await _docs.DeleteDocument(UserId, id);
        return res.IsSuccess ? NoContent() : ProblemResponse(res);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromBody] DeleteReq req)
    {
        var res = await _docs.DeleteDocuments(UserId, req.Ids);
        return res.IsSuccess ? NoContent() : ProblemResponse(res);
    }

    [HttpPost("{id:int}")]
    public async Task<IActionResult> Restore(int id)
    {
        var res = await _docs.RestoreDocument(UserId, id);
        return res.IsSuccess ? Ok() : ProblemResponse(res);
    }
}