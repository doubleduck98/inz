using inz.Server.Services;
using inz.Server.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace inz.Server.Controllers.MvcControllers;

public class AccountController : Controller
{
    private readonly IAuthService _authService;

    public AccountController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet]
    public IActionResult Login()
    {
        var model = new LoginModel();
        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Login(LoginModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var resp = await _authService.SignIn(model.Email, model.Password, HttpContext);
        if (resp.IsSuccess)
        {
            var returnUrl = HttpContext.Request.Query["returnUrl"];
            var redirectUrl = returnUrl.IsNullOrEmpty()
                ? "https://localhost:5173"
                : $"https://localhost:5173/{returnUrl}";
            return Redirect(redirectUrl);
        }

        ModelState.AddModelError("Auth", "Nieprawidłowe dane logowania");
        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        return LocalRedirect("/Account/Login");
    }
}