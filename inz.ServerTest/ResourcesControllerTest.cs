using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using inz.Server;
using inz.Server.Controllers;
using inz.Server.Dtos.Resources;
using inz.Server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace inz.ServerTest;

public class ResourcesControllerTest
{
    private readonly ResourcesController _controller;
    private readonly Mock<IDocumentsService> _documentsService = new();

    public ResourcesControllerTest()
    {
        _controller = new ResourcesController(_documentsService.Object);
        var user = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(JwtRegisteredClaimNames.Sub, "")
        ], "Test"));
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Fact]
    public async Task Get_FileNotFound_ShouldReturn404()
    {
        _documentsService.Setup(d => d.GetFileMetadataById(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Failure<DocumentDto>(Error.FileNotFound));

        var res = await _controller.Get(It.IsAny<int>());
        var nfRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(nfRes!.StatusCode, 404);
    }

    [Fact]
    public async Task Get_FileFound_ShouldReturn200()
    {
        _documentsService.Setup(d => d.GetFileMetadataById(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(new DocumentDto());

        var res = await _controller.Get(It.IsAny<int>());
        var okRes = res as OkObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.IsType<DocumentDto>(okRes!.Value);
    }

    [Fact]
    public async Task GetByName_FileNotFound_ShouldReturn404()
    {
        _documentsService.Setup(d => d.GetFileMetadata(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(Result.Failure<DocumentDto>(Error.FileNotFound));

        var req = new GetFileReq { FileName = "" };
        var res = await _controller.Get(req);

        var nfRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(nfRes!.StatusCode, 404);
    }

    [Fact]
    public async Task GetByName_FileFound_ShouldReturn200()
    {
        _documentsService.Setup(d => d.GetFileMetadata(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(new DocumentDto());

        var req = new GetFileReq { FileName = "" };
        var res = await _controller.Get(req);

        var okRes = res as OkObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.IsType<DocumentDto>(okRes!.Value);
    }

    [Fact]
    public async Task GetAll_ShouldReturn200()
    {
        _documentsService.Setup(d => d.GetFilesForUser(It.IsAny<string>())).ReturnsAsync([]);

        var res = await _controller.GetAll();
        var okRes = res as OkObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.IsType<List<DocumentDto>>(okRes!.Value);
    }

    [Fact]
    public async Task GetFile_FileNotFound_ShouldReturn404()
    {
        _documentsService.Setup(d => d.GetFile(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(Result.Failure<FileStream>(Error.FileNotFound));

        var req = new GetFileReq { FileName = "" };
        var res = await _controller.GetFile(req);

        var nfRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(404, nfRes!.StatusCode);
    }

    [Fact]
    public async Task GetFile_FileFound_ShouldReturn200()
    {
        var fs = new Mock<FileStream>(new IntPtr(1), FileAccess.Read);
        _documentsService.Setup(d => d.GetFile(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(fs.Object);

        var req = new GetFileReq { FileName = "" };
        var res = await _controller.GetFile(req);

        var fsRes = res as FileStreamResult;
        Assert.IsType<FileStreamResult>(res);
        Assert.NotNull(fsRes!.FileStream);
    }

    // duplicate test lata

    [Fact]
    public async Task Create_ShouldReturn201()
    {
        _documentsService.Setup(d => d.SaveDocument(It.IsAny<string>(), It.IsAny<IFormFile>()))
            .ReturnsAsync(new DocumentDto());

        var res = await _controller.Create(It.IsAny<IFormFile>());
        
        var okRes = res as CreatedResult;
        Assert.IsType<CreatedResult>(res);
        Assert.IsType<DocumentDto>(okRes!.Value);
    }

    [Fact]
    public async Task Delete_FileNotFound_ShouldReturn404()
    {
        _documentsService.Setup(d => d.DeleteDocument(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Failure<FileStream>(Error.FileNotFound));
        
        var res = await _controller.Delete(It.IsAny<int>());

        var nfRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(404, nfRes!.StatusCode);
    }

    [Fact]
    public async Task Delete_ShouldReturn204()
    {
        _documentsService.Setup(d => d.DeleteDocument(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Success());
        
        var res = await _controller.Delete(It.IsAny<int>());
        
        Assert.IsType<NoContentResult>(res);
    }
}