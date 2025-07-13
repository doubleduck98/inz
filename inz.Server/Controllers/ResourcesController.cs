using inz.Server.Dtos.Resources;
using inz.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[Route("[controller]/[action]")]
public class ResourcesController : ApiBaseController
{
    private readonly IDocumentsService _docs;

    public ResourcesController([FromServices] IDocumentsService documents)
    {
        _docs = documents;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var docs = await _docs.GetDocuments(UserId);
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
        var singleFile = req.Ids.Length == 1;
        var res = singleFile
            ? await _docs.GetFileStream(UserId, req.Ids.First())
            : await _docs.GetFileArchive(UserId, req.Ids);
        return res.IsSuccess
            ? File(res.Value.File, singleFile ? "application/octet-stream" : "application/zip", res.Value.FileName)
            : ProblemResponse(res);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateFileReq req)
    {
        var res = await _docs.SaveDocument(UserId, req);
        return res.IsSuccess ? Created($"/{res.Value.Id}", res.Value) : ProblemResponse(res);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Edit(int id, [FromBody] EditFileReq req)
    {
        var res = await _docs.EditDocument(UserId, id, req);
        return res.IsSuccess ? Ok(res.Value) : ProblemResponse(res);
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

    [HttpGet]
    public async Task<IActionResult> GetDeleted()
    {
        var docs = await _docs.GetDeletedDocuments(UserId);
        return Ok(docs);
    }

    [HttpPost("{id:int}")]
    public async Task<IActionResult> Restore(int id)
    {
        var res = await _docs.RestoreDocument(UserId, id);
        return res.IsSuccess ? Ok(res.Value) : ProblemResponse(res);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Purge(int id)
    {
        var res = await _docs.PurgeDocument(UserId, id);
        return res.IsSuccess ? NoContent() : ProblemResponse(res);
    }
}