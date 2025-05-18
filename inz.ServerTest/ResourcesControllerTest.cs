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
        var user = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(JwtRegisteredClaimNames.Sub, "")
        ], "Test"));
        var contextAccessor = new Mock<IHttpContextAccessor>();
        contextAccessor.Setup(c => c.HttpContext!.User).Returns(user);

        _controller = new ResourcesController(_documentsService.Object, contextAccessor.Object);
    }

    [Fact]
    public async Task Get_ShouldReturnDocList()
    {
        _documentsService.Setup(d => d.GetFiles(It.IsAny<string>())).ReturnsAsync([]);

        var res = await _controller.Get();
        var oRes = res as ObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.Equal(StatusCodes.Status200OK, oRes!.StatusCode);
    }

    [Fact]
    public async Task Download_FileNotFound_ShouldReturn404()
    {
        _documentsService.Setup(d => d.GetFileStream(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Failure<DocumentStreamDto>(Error.FileNotFound));

        var res = await _controller.Download(It.IsAny<int>());
        var nfRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status404NotFound, nfRes!.StatusCode);
    }

    [Fact]
    public async Task Download_FileFound_ShouldReturn200()
    {
        var mockStream = new Mock<Stream>().Object;
        _documentsService.Setup(d => d.GetFileStream(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Success(new DocumentStreamDto(mockStream,"")));

        var res = await _controller.Download(It.IsAny<int>());
        Assert.IsType<FileStreamResult>(res);
    }

    [Fact]
    public async Task Create_ShouldReturn201()
    {
        _documentsService.Setup(d => d.SaveDocument(It.IsAny<string>(), It.IsAny<IFormFile>(), It.IsAny<string>()))
            .ReturnsAsync(new DocumentDto());

        var req = new CreateFileReq(It.IsAny<IFormFile>(), It.IsAny<string>());
        var res = await _controller.Create(req);

        var okRes = res as CreatedResult;
        Assert.IsType<CreatedResult>(res);
        Assert.IsType<DocumentDto>(okRes!.Value);
    }

    [Fact]
    public async Task Create_DuplicateShouldReturn409()
    {
        _documentsService.Setup(d => d.SaveDocument(It.IsAny<string>(), It.IsAny<IFormFile>(), It.IsAny<string>()))
            .ReturnsAsync(Result.Failure<DocumentDto>(Error.FileAlreadyExists));

        var req = new CreateFileReq(It.IsAny<IFormFile>(), It.IsAny<string>());
        var res = await _controller.Create(req);
        var confRes = res as ObjectResult;

        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status409Conflict, confRes!.StatusCode);
    }

    [Fact]
    public async Task Delete_FileNotFound_ShouldReturn404()
    {
        _documentsService.Setup(d => d.DeleteDocument(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Failure<FileStream>(Error.FileNotFound));

        var res = await _controller.Delete(It.IsAny<int>());

        var nfRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status404NotFound, nfRes!.StatusCode);
    }

    [Fact]
    public async Task Delete_ShouldReturn204()
    {
        _documentsService.Setup(d => d.DeleteDocument(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Success());

        var res = await _controller.Delete(It.IsAny<int>());

        Assert.IsType<NoContentResult>(res);
    }

    [Fact]
    public async Task Restore_ShouldReturn200()
    {
        _documentsService.Setup(d => d.RestoreDocument(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Success());

        var res = await _controller.Restore(It.IsAny<int>());

        var okRes = res as OkResult;
        Assert.IsType<OkResult>(res);
        Assert.Equal(200, okRes!.StatusCode);
    }

    [Fact]
    public async Task Restore_FileAlreadyFound_ShouldReturn409()
    {
        _documentsService.Setup(d => d.RestoreDocument(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Failure(Error.FileAlreadyExists));

        var res = await _controller.Restore(It.IsAny<int>());

        var confRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status409Conflict, confRes!.StatusCode);
    }
}