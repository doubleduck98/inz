using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using inz.Server;
using inz.Server.Controllers.ApiControllers;
using inz.Server.Dtos.Auth;
using inz.Server.Services;
using inz.ServerTest.Factories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace inz.ServerTest;

public class AuthControllerTest
{
    private readonly AuthController _controller;
    private readonly Mock<IAuthService> _authService = new();

    public AuthControllerTest()
    {
        _controller = new AuthController(_authService.Object)
        {
            ControllerContext =
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity([
                        new Claim(JwtRegisteredClaimNames.Sub, ""),
                        new Claim("UserId", "")
                    ], "Test"))
                }
            }
        };
    }

    [Fact]
    public async Task LoginWrongCredentials_ShouldReturn400()
    {
        _authService.Setup(a => a.LoginAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(Result.Failure<LoginResp>(Error.AuthenticationFailed));

        var req = ReqFactory.LoginReq;
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
            .ReturnsAsync(DtoFactory.LoginResp);

        var req = new LoginReq(e, p);
        var res = await _controller.Login(req);

        _authService.Verify(a => a.LoginAsync(e, p), Times.Once);
        Assert.IsType<OkObjectResult>(res);
    }

    [Fact]
    public async Task GetToken_ShouldReturn200()
    {
        _authService.Setup(a => a.LoginWithToken(It.IsAny<string>())).ReturnsAsync(DtoFactory.LoginResp);

        var res = await _controller.GetToken();

        _authService.Verify(a => a.LoginWithToken(It.IsAny<string>()), Times.Once);
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
            .ReturnsAsync(DtoFactory.RefreshResp);

        var req = new RefreshReq("token");
        var res = await _controller.Refresh(req);

        _authService.Verify(a => a.RefreshTokenAsync(It.IsAny<string>()), Times.Once);
        Assert.IsType<OkObjectResult>(res);
    }

    [Fact]
    public async Task LogoutInvalidToken_ShouldReturn401()
    {
        _authService
            .Setup(a => a.InvalidateUserTokenAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<HttpContext>()))
            .ReturnsAsync(Result.Failure(Error.InvalidToken));

        var req = new LogoutReq("test");
        var res = await _controller.Logout(req);
        var oRes = res as ObjectResult;

        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status401Unauthorized, oRes?.StatusCode);
    }

    [Fact]
    public async Task Logout_ShouldReturn200()
    {
        _authService.Setup(a =>
                a.InvalidateUserTokenAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<HttpContext>()))
            .ReturnsAsync(Result.Success());

        var req = new LogoutReq("test");
        var res = await _controller.Logout(req);

        Assert.IsType<OkResult>(res);
    }
}