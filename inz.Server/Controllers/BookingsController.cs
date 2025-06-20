using inz.Server.Dtos.Bookings;
using inz.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers;

[ApiController]
[Route("[controller]/[action]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class BookingsController : ApiBaseController
{
    private readonly IBookingsService _bookings;

    public BookingsController(
        [FromServices] IBookingsService bookingsService
    )
    {
        _bookings = bookingsService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateOnly date, [FromQuery] DateOnly? endDate)
    {
        var res = endDate == null
            ? await _bookings.GetBookingsForDay(UserId, date)
            : await _bookings.GetBookingsForWeek(UserId, date, endDate.Value);
        return Ok(res);
    }

    [HttpGet]
    public async Task<IActionResult> GetFree([FromQuery] FreeReq req)
    {
        var res = await _bookings.GetAvailableDates(req.RoomId, req.Dates);
        return Ok(res);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingReq req)
    {
        var res = await _bookings.CreateBooking(UserId, req);
        return res.IsSuccess ? Ok(res.Value) : ProblemResponse(res);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var res = await _bookings.DeleteBooking(UserId, id);
        return res.IsSuccess ? NoContent() : ProblemResponse(res);
    }
}