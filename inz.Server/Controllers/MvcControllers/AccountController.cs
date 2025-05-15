using inz.Server.Services;
using inz.Server.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        if (resp.IsSuccess) return Redirect("https://localhost:5173");
        
        ModelState.AddModelError("Auth", "Nieprawidłowe dane logowania");
        return View(model);
    }

    [HttpGet]
    [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        HttpContext.Response.Cookies.Delete("jwt");
        return RedirectToAction("Login");
    }
}