using inz.Server.Services;
using inz.Server.ViewModels.Account;
using inz.Server.ViewModels.Users;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace inz.Server.Controllers.MvcControllers;

public class AccountController : Controller
{
    private readonly IAuthService _authService;
    private readonly IUsersService _users;

    public AccountController([FromServices] IAuthService authService, [FromServices] IUsersService usersService)
    {
        _authService = authService;
        _users = usersService;
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

            if (!returnUrl.IsNullOrEmpty() && returnUrl.ToString().StartsWith("/Admin"))
            {
                return LocalRedirect(returnUrl!);
            }

            var redirectUrl = returnUrl.IsNullOrEmpty()
                ? "https://localhost:5173"
                : $"https://localhost:5173{returnUrl}";
            return Redirect(redirectUrl);
        }

        ModelState.AddModelError("Auth", "Nieprawidłowe dane logowania!");
        return View(model);
    }

    [HttpPost]
    [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        return LocalRedirect("/Account/Login");
    }

    [HttpGet]
    [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
    public IActionResult ChangePassword()
    {
        var model = new ChangePasswordViewModel();
        return View(model);
    }

    [HttpPost]
    [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
    {
        if (!ModelState.IsValid) return View(model);
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null)
        {
            await HttpContext.SignOutAsync();
            return RedirectToAction("Login");
        }

        var res = await _users.ChangePassword(userId, model.OldPassword, model.NewPassword);
        if (res.IsSuccess)
        {
            TempData["SuccessMessage"] = "Pomyślnie zmieniono hasło.";
            return RedirectToAction("ChangePassword");
        }

        switch (res.Error)
        {
            case AppErrors.InvalidPasswordError e:
                ModelState.AddModelError(nameof(model.OldPassword), e.Message);
                break;

            case AppErrors.GenericError e:
                ModelState.AddModelError(string.Empty, e.Message);
                break;
        }

        return View(model);
    }
}