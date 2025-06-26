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
        if (endDate != null)
        {
            var week = await _bookings.GetBookingsForWeek(UserId, date, endDate.Value);
            return Ok(week);
        }

        var day = await _bookings.GetBookingsForDay(UserId, date);
        return Ok(day);
    }

    [HttpGet]
    public async Task<IActionResult> GetFree([FromQuery] FreeReq req)
    {
        var res = await _bookings.GetAvailableDates(UserId, req.RoomId, req.Dates);
        return Ok(res);
    }

    [HttpGet]
    public async Task<IActionResult> Rooms()
    {
        var rooms = await _bookings.GetRooms();
        return Ok(rooms);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingReq req)
    {
        var res = await _bookings.CreateBooking(UserId, req);
        return res.IsSuccess ? Ok(res.Value) : ProblemResponse(res);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Edit(int id, [FromBody] EditBookingReq req)
    {
        var res = await _bookings.EditBooking(UserId, id, req);
        return res.IsSuccess ? Ok() : ProblemResponse(res);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var res = await _bookings.DeleteBooking(UserId, id);
        return res.IsSuccess ? NoContent() : ProblemResponse(res);
    }
}