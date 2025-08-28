using inz.Server.Services;
using inz.Server.ViewModels.Rooms;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers.MvcControllers;

[Route("Admin/Rooms")]
[Authorize(Roles = "Admin", AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class RoomsAdminController : Controller
{
    private readonly IBookingsService _bookings;

    public RoomsAdminController([FromServices] IBookingsService bookingsService)
    {
        _bookings = bookingsService;
    }

    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var rooms = await _bookings.GetRooms();
        var model = new RoomIndexViewModel
        {
            Rooms = rooms
        };
        return View(model);
    }

    [HttpGet("Create")]
    public IActionResult Create()
    {
        return View();
    }

    [HttpPost("Create")]
    public async Task<IActionResult> Create(RoomCreateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);
        var res = await _bookings.AdminAddRoom(model);
        if (res.IsSuccess)
        {
            TempData["SuccessMessage"] = $"Pomyślnie dodano salę: {model.Name}";
            return RedirectToAction("Index");
        }

        ModelState.AddModelError(nameof(model.Name), res.Error!.Message);
        return View(model);
    }

    [HttpGet("Delete/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var res = await _bookings.AdminGetRoom(id);
        if (res.IsFailure) return BadRequest();

        var room = res.Value;
        var model = new RoomDeleteViewModel
        {
            Id = room.Id,
            Name = room.Name
        };
        return PartialView("_Delete", model);
    }

    [HttpPost("Delete/{id:int}")]
    public async Task<IActionResult> Delete(int id, RoomDeleteViewModel model)
    {
        if (id != model.Id) return BadRequest();
        await _bookings.AdminDeleteRoom(id);
        TempData["SuccessMessage"] = $"Pomyślnie usunięto salę {model.Name}";
        return RedirectToAction("Index");
    }
}