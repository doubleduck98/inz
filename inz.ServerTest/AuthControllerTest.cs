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
    private readonly Mock<ITokenProvider> _tokenProvider = new();
    private readonly Mock<UserManager<User>> _userManager;

    public AuthControllerTest()
    {
        var mockUserStore = new Mock<IUserStore<User>>().As<IUserRoleStore<User>>();
        _userManager =
            new Mock<UserManager<User>>(mockUserStore.Object, null!, null!, null!, null!, null!, null!, null!, null!);
        _userManager.Setup(um => um.RemoveAuthenticationTokenAsync(
                It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);
        _userManager
            .Setup(um => um.GenerateUserTokenAsync(It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync("");
        _userManager.Setup(um => um.SetAuthenticationTokenAsync(
                It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);
        _controller = new AuthController(_tokenProvider.Object, _userManager.Object);
    }

    [Fact]
    public async Task LoginUserNotFound_ShouldReturn400()
    {
        _userManager.Setup(um => um.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(() => null);
        var req = new LoginReq { Email = "correct@email.com" };
        var res = await _controller.Login(req);
        Assert.IsType<BadRequestObjectResult>(res);
    }

    [Theory]
    [InlineData("mike.wazowski@gmail.com", "password1")]
    [InlineData("correct@email.com", "password2")]
    public async Task LoginCorrect_ShouldReturn200(string e, string p)
    {
        _userManager.Setup(um => um.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(new User());
        var req = new LoginReq { Email = e, Password = p };
        var res = await _controller.Login(req);

        Assert.IsType<OkObjectResult>(res);
        _userManager
            .Verify(tp => tp.GenerateUserTokenAsync(It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>()),
                Times.Once);
        _userManager
            .Verify(tp => tp.SetAuthenticationTokenAsync(It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<string>()), Times.Once);
        _tokenProvider.Verify(tp => tp.Create(), Times.Once);
    }
}