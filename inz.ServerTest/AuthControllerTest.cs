using inz.Server;
using inz.Server.Controllers;
using inz.Server.Dtos;
using inz.Server.Models;
using Microsoft.AspNetCore.Identity;
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
    }

    [Fact]
    public async Task LoginUserNotFound_ShouldReturn400()
    {
        _authService.Setup(a => a.FindUserByEmailAsync(It.IsAny<string>())).ReturnsAsync(() => null);
        var req = new LoginReq { Email = "correct@email.com" };
        var res = await _controller.Login(req);
        Assert.IsType<BadRequestObjectResult>(res);
    }

    [Fact]
    public async Task LoginWrongCredentials_ShouldReturn400()
    {
        _authService.Setup(um => um.FindUserByEmailAsync(It.IsAny<string>())).ReturnsAsync(new User());
        _authService.Setup(a => a.VerifyUserAsync(It.IsAny<User>(), It.IsAny<string>())).ReturnsAsync(false);
        var req = new LoginReq { Email = "correct@email.com" };
        var res = await _controller.Login(req);
        Assert.IsType<UnauthorizedObjectResult>(res);
    }

    [Theory]
    [InlineData("mike.wazowski@gmail.com", "password1")]
    [InlineData("correct@email.com", "password2")]
    public async Task LoginCorrect_ShouldReturn200(string e, string p)
    {
        _authService.Setup(um => um.FindUserByEmailAsync(It.IsAny<string>())).ReturnsAsync(new User());
        _authService.Setup(a => a.VerifyUserAsync(It.IsAny<User>(), It.IsAny<string>())).ReturnsAsync(true);
        var req = new LoginReq { Email = e, Password = p };
        var res = await _controller.Login(req);

        Assert.IsType<OkObjectResult>(res);
        _authService.Verify(a => a.GetAuthTokenAsync(It.IsAny<User>()), Times.Once);
        _authService.Verify(a => a.GetRefreshTokenAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task RefreshUserNotFound_ShouldReturn400()
    {
        _authService.Setup(a => a.FindTokenOwnerAsync(It.IsAny<string>())).ReturnsAsync(() => null);
        var req = new RefreshReq { Token = "xd" };
        var res = await _controller.Refresh(req);
        Assert.IsType<BadRequestResult>(res);
    }

    [Fact]
    public async Task RefreshInvalidToken_ShouldReturn400()
    {
        _authService.Setup(a => a.FindTokenOwnerAsync(It.IsAny<string>())).ReturnsAsync(new User());
        _authService.Setup(a => a.RefreshTokenAsync(It.IsAny<User>(), It.IsAny<string>()))
            .ReturnsAsync(Result<string>.Failure(""));
        var req = new RefreshReq { Token = "token" };
        var res = await _controller.Refresh(req);
        Assert.IsType<BadRequestObjectResult>(res);
    }

    [Fact]
    public async Task RefreshValid_ShouldReturn200()
    {
        _authService.Setup(a => a.FindTokenOwnerAsync(It.IsAny<string>())).ReturnsAsync(new User());
        _authService.Setup(a => a.RefreshTokenAsync(It.IsAny<User>(), It.IsAny<string>()))
            .ReturnsAsync(Result<string>.Success(""));
        var req = new RefreshReq { Token = "token" };
        var res = await _controller.Refresh(req);
        Assert.IsType<OkObjectResult>(res);
        _authService.Verify(a => a.GetAuthTokenAsync(It.IsAny<User>()), Times.Once);
    }
}