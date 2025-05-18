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
    private readonly string _userId;

    public ResourcesController([FromServices] IDocumentsService documents)
    {
        _userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
                  throw new AuthenticationFailureException("User id claim not found");
        _docs = documents;
    }

    private IActionResult ResultResponse(Result result, IActionResult successResp)
    {
        return result.IsSuccess
            ? successResp
            : Problem(result.Error!.Message, type: result.Error.Type, statusCode: result.Error.Code);
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromBody] GetFileReq req)
    {
        var res = await _docs.GetFileMetadata(_userId, req.FileName);
        return ResultResponse(res, Ok(res.Value));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var res = await _docs.GetFileMetadataById(_userId, id);
        return ResultResponse(res, Ok(res.Value));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var docs = await _docs.GetFilesForUser(_userId);
        return Ok(docs);
    }

    [HttpGet]
    public async Task<IActionResult> GetFile([FromBody] GetFileReq req)
    {
        var res = await _docs.GetFile(_userId, req.FileName);
        return ResultResponse(res, File(res.Value, "application/octet-stream", req.FileName));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] IFormFile file)
    {
        var res = await _docs.SaveDocument(_userId, file);
        return ResultResponse(res, Created($"/{res.Value.Id}", res.Value));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Edit(int id, [FromBody] EditFileReq req)
    {
        var res = await _docs.EditDocument(_userId, id, req.FileName);
        return ResultResponse(res, Ok());
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var res = await _docs.DeleteDocument(_userId, id);
        return ResultResponse(res, NoContent());
    }

    [HttpPost("{id:int}")]
    public async Task<IActionResult> Restore(int id)
    {
        var res = await _docs.RestoreDocument(_userId, id);
        return ResultResponse(res, Ok());
    }
}