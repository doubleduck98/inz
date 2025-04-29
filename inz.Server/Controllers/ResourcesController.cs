using inz.Server.Dtos.Resources;
using inz.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace inz.Server.Controllers;

[ApiController]
[Authorize]
[Route("[controller]/[action]")]
public class ResourcesController : ControllerBase
{
    private readonly IDocumentsService _docs;

    public ResourcesController([FromServices] IDocumentsService documents)
    {
        _docs = documents;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromBody] GetFileReq req)
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var res = await _docs.GetFileMetadata(userId, req.FileName);
        return res.IsSuccess ? Ok(res.Value) : Problem(res.Error!.Message, statusCode: 404);
    }

    [HttpGet]
    [Route("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var res = await _docs.GetFileMetadataById(userId, id);
        return res.IsSuccess ? Ok(res.Value) : Problem(res.Error!.Message, statusCode: 404);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var docs = await _docs.GetFilesForUser(userId);
        return Ok(docs);
    }

    [HttpGet]
    public async Task<IActionResult> GetFile([FromBody] GetFileReq req)
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var res = await _docs.GetFile(userId, req.FileName);
        return res.IsSuccess
            ? File(res.Value!, "application/octet-stream", req.FileName)
            : Problem(res.Error!.Message, statusCode: 404);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] IFormFile file)
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var res = await _docs.SaveDocument(userId, file);
        return res.IsSuccess ? Created($"/{res.Value!.Id}", res.Value) : Problem(res.Error?.Message);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Edit(int id, [FromBody] EditFileReq req)
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var res = await _docs.EditDocument(userId, id, req.FileName);
        return res.IsSuccess ? Ok() : Problem(res.Error!.Message, statusCode: 404);
    }

    [HttpDelete]
    [Route("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var res = await _docs.DeleteDocument(userId, id);
        return res.IsSuccess ? NoContent() : Problem(res.Error!.Message, statusCode: 404);
    }

    [HttpPost("{id:int}")]
    public async Task<IActionResult> Restore(int id)
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var res = await _docs.RestoreDocument(userId, id);
        return res.IsSuccess ? Ok() : Problem(res.Error!.Message, statusCode: 404);
    }
}