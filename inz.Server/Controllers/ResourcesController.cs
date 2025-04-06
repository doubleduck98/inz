using inz.Server.Dtos.Resources;
using inz.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers;

[ApiController]
[Authorize]
[Route("[controller]/[action]")]
public class ResourcesController : ControllerBase
{
    private readonly IDocumentsRepository _docs;

    public ResourcesController([FromServices] IDocumentsRepository documents)
    {
        _docs = documents;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromBody] GetFileReq req)
    {
        var userId = HttpContext.User.FindFirst("Sub")!.Value;
        var doc = await _docs.GetFileMetadata(userId, req.FileName);
        return Ok(new DocumentDto { FileName = doc.FileName, FileType = doc.FileType.ToString(), Id = doc.Id });
    }

    [HttpGet]
    [Route("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var userId = HttpContext.User.FindFirst("Sub")!.Value;
        var res = await _docs.GetFileMetadataById(userId, id);
        return res.IsSuccess
            ? Ok(new DocumentDto
                { FileName = res.Value!.FileName, FileType = res.Value.FileType.ToString(), Id = res.Value.Id })
            : Problem(res.Error!.Message, statusCode: 404);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = HttpContext.User.FindFirst("Sub")!.Value;
        var docs = await _docs.GetFilesForUser(userId);
        return Ok(docs);
    }

    [HttpGet]
    public async Task<IActionResult> GetFile([FromBody] GetFileReq req)
    {
        var userId = HttpContext.User.FindFirst("Sub")!.Value;
        var fs = await _docs.GetFile(userId, req.FileName);
        return File(fs, "application/octet-stream", req.FileName);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] IFormFile file)
    {
        var userId = HttpContext.User.FindFirst("Sub")!.Value;
        var res = await _docs.SaveDocument(userId, file);
        return res.IsSuccess ? Created(string.Empty, res.Value) : Problem(res.Error?.Message);
    }

    [HttpDelete]
    [Route("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = HttpContext.User.FindFirst("Sub")!.Value;
        await _docs.DeleteDocument(userId, id);
        return NoContent();
    }
}