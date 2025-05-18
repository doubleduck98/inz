using inz.Server;
using inz.Server.Controllers;
using inz.Server.Dtos.Auth;
using inz.Server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace inz.ServerTest;

public class AuthControllerTest
{
    private readonly AuthController _controller;
    private readonly Mock<IAuthService> _authService;

    public AuthControllerTest()
    {
        _authService = new Mock<IAuthService>();
        _controller = new AuthController(_authService.Object);
        
        var mockresponse = new Mock<HttpResponse>();
        var mockHttpContext = new Mock<HttpContext>();
        mockHttpContext.Setup(c => c.Response).Returns(mockresponse.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = mockHttpContext.Object
        };
    }

    [Fact]
    public async Task LoginWrongCredentials_ShouldReturn400()
    {
        _authService.Setup(a => a.LoginAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(Result.Failure<LoginResp>(Error.AuthenticationFailed));
        
        var req = new LoginReq("correct@email.com", "qwe");
        var res = await _controller.Login(req);
        var oRes = res as ObjectResult;
        
        Assert.IsType<ObjectResult>(res);
        Assert.NotNull(oRes);
        Assert.Equal(StatusCodes.Status400BadRequest, oRes.StatusCode);
    }

    [Theory]
    [InlineData("mike.wazowski@gmail.com", "password1")]
    [InlineData("correct@email.com", "password2")]
    public async Task LoginCorrect_ShouldReturn200(string e, string p)
    {
        _authService.Setup(a => a.LoginAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(Result.Success(new LoginResp(It.IsAny<UserDto>(), It.IsAny<string>()))); 
        
        var req = new LoginReq(e, p);
        var res = await _controller.Login(req);

        _authService.Verify(a => a.LoginAsync(e, p), Times.Once);
        Assert.IsType<OkObjectResult>(res);
    }

    [Fact]
    public async Task RefreshInvalidToken_ShouldReturn401()
    {
        _authService.Setup(a => a.RefreshTokenAsync(It.IsAny<string>()))
            .ReturnsAsync(Result.Failure<RefreshResp>(Error.InvalidToken));
        
        var req = new RefreshReq("token");
        var res = await _controller.Refresh(req);
        var oRes = res as ObjectResult;
        
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status401Unauthorized, oRes?.StatusCode);
    }

    [Fact]
    public async Task RefreshValid_ShouldReturn200()
    {
        _authService.Setup(a => a.RefreshTokenAsync(It.IsAny<string>()))
            .ReturnsAsync(Result.Success(new RefreshResp(It.IsAny<string>(), It.IsAny<string>())));
        
        var req = new RefreshReq("token");
        var res = await _controller.Refresh(req);
        
        _authService.Verify(a => a.RefreshTokenAsync(It.IsAny<string>()), Times.Once);
        Assert.IsType<OkObjectResult>(res);
    }
}