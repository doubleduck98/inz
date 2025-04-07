using inz.Server.Dtos.Resources;
using inz.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
        var doc = await _docs.GetFileMetadata(userId, req.FileName);
        return Ok(doc);
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
        var fs = await _docs.GetFile(userId, req.FileName);
        return File(fs, "application/octet-stream", req.FileName);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] IFormFile file)
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var res = await _docs.SaveDocument(userId, file);
        return res.IsSuccess ? Created(string.Empty, res.Value) : Problem(res.Error?.Message);
    }

    [HttpDelete]
    [Route("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
        var res = await _docs.DeleteDocument(userId, id);
        return res.IsSuccess ? NoContent() : Problem(res.Error!.Message, statusCode:404);
    }
}