using inz.Server.Services;
using inz.Server.ViewModels.Users;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers.MvcControllers;

[Authorize(Roles = "Admin", AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
[Route("Admin/Users")]
public class UsersAdminController : Controller
{
    private readonly IUsersService _users;

    public UsersAdminController(IUsersService users)
    {
        _users = users;
    }

    [HttpGet("")]
    public async Task<IActionResult> Index(string? search, int? page)
    {
        const int pageSize = 20;
        var currentPage = page ?? 1;
        currentPage = currentPage < 1 ? 1 : currentPage;

        var dto = await _users.GetUsers(search, currentPage, pageSize);
        var model = new IndexViewModel
        {
            Users = dto.Users,
            Search = search,
            Page = currentPage,
            TotalPages = dto.TotalPages
        };

        return View(model);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> UserDetails(string id)
    {
        var res = await _users.GetUser(id);
        if (res.IsFailure) return NotFound();

        var user = res.Value;
        var model = new UserDetailsViewModel
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Email = user.Email,
            PhoneNumber = user.Phone
        };
        return View(model);
    }

    [HttpGet("Create")]
    public IActionResult Create()
    {
        var model = new CreateViewModel();
        return View(model);
    }

    [HttpPost("Create")]
    public async Task<IActionResult> Create(CreateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var res = await _users.CreateUser(model);
        if (res.IsSuccess)
        {
            TempData["SuccessMessage"] = $"Pomyślnie utworzono użytkownika {model.Email}.";
            return RedirectToAction("Index");
        }

        switch (res.Error)
        {
            case AppErrors.DuplicateUserName e:
                ModelState.AddModelError(nameof(model.Email), e.Message);
                break;

            case AppErrors.InvalidPasswordError e:
                ModelState.AddModelError(nameof(model.Password), e.Message);
                break;

            case AppErrors.GenericError e:
                ModelState.AddModelError(string.Empty, e.Message);
                break;
        }

        return View(model);
    }

    [HttpGet("Edit/{id}")]
    public async Task<IActionResult> Edit(string id, string? returnUrl = null)
    {
        var res = await _users.GetUser(id);
        if (res.IsFailure) return NotFound(res.Error!.Message);
        var user = res.Value;
        var model = new EditUserViewModel
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Email = user.Email,
            ReturnUrl = returnUrl
        };

        return View(model);
    }

    [HttpPost("Edit/{id}")]
    public async Task<IActionResult> Edit(string id, EditUserViewModel model)
    {
        if (id != model.Id) return BadRequest();
        if (!ModelState.IsValid) return View(model);

        var res = await _users.UpdateUser(model);
        if (res.IsSuccess)
        {
            TempData["SuccessMessage"] = $"Pomyślnie zedytowano użytkownika {model.Name} {model.Surname}.";
            return RedirectToAction("Index");
        }

        switch (res.Error)
        {
            case AppErrors.DuplicateUserName e:
                ModelState.AddModelError(nameof(model.Email), e.Message);
                break;

            case AppErrors.GenericError e:
                ModelState.AddModelError(string.Empty, e.Message);
                break;
        }

        return View(model);
    }

    [HttpGet("Delete/{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var res = await _users.GetUser(id);
        if (res.IsFailure) return NotFound();

        var user = res.Value;
        var model = new DeleteViewModel
        {
            Id = user.Id,
            NameSurname = $"{user.Name} {user.Surname}"
        };
        return PartialView("_Delete", model);
    }

    [HttpPost("Delete/{id}")]
    public async Task<IActionResult> Delete(string id, DeleteViewModel model)
    {
        await _users.DeleteUser(id);
        TempData["SuccessMessage"] = $"Pomyślnie usunięto użytkownika {model.NameSurname}";
        return RedirectToAction("Index");
    }

    [HttpGet("ResetPassword/{id}")]
    public async Task<IActionResult> ResetPassword(string id)
    {
        var res = await _users.GetUser(id);
        if (res.IsFailure) return NotFound();

        var user = res.Value;
        var viewModel = new ResetPasswordViewModel
        {
            UserId = user.Id,
            NameSurname = $"{user.Name} {user.Surname}"
        };

        return View(viewModel);
    }

    [HttpPost("ResetPassword/{id}")]
    public async Task<IActionResult> ResetPassword(string id, ResetPasswordViewModel model)
    {
        if (!ModelState.IsValid) return View(model);
        var res = await _users.ChangePassword(id, model.NewPassword);
        if (res.IsSuccess)
        {
            TempData["SuccessMessage"] = $"Pomyślnie zmieniono hasło dla {model.NameSurname}";
            return RedirectToAction("UserDetails", new { id = model.UserId });
        }

        switch (res.Error)
        {
            case AppErrors.InvalidPasswordError e:
                ModelState.AddModelError(nameof(model.NewPassword), e.Message);
                break;

            case AppErrors.GenericError e:
                ModelState.AddModelError(string.Empty, e.Message);
                break;
        }

        return View(model);
    }
}