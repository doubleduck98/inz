using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using inz.Server;
using inz.Server.Controllers;
using inz.Server.Controllers.ApiControllers;
using inz.Server.Dtos.Bookings;
using inz.Server.Services;
using inz.ServerTest.Factories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace inz.ServerTest;

public class BookingsControllerTest
{
    private readonly BookingsController _controller;
    private readonly Mock<IBookingsService> _bookingService = new();

    public BookingsControllerTest()
    {
        _controller = new BookingsController(_bookingService.Object)
        {
            ControllerContext =
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity([
                        new Claim(JwtRegisteredClaimNames.Sub, "")
                    ], "Test"))
                }
            }
        };
    }

    [Fact]
    public async Task GetDay_ShouldReturnBookingList()
    {
        _bookingService.Setup(b => b.GetBookingsForDay(It.IsAny<string>(), It.IsAny<DateOnly>()))
            .ReturnsAsync([]);

        var res = await _controller.Get(DateOnly.MinValue, null);
        var oRes = res as ObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.Equal(StatusCodes.Status200OK, oRes!.StatusCode);
    }

    [Fact]
    public async Task GetWeek_ShouldReturnBookingList()
    {
        _bookingService.Setup(b => b.GetBookingsForWeek(It.IsAny<string>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>()))
            .ReturnsAsync([]);

        var res = await _controller.Get(DateOnly.MinValue, DateOnly.MaxValue);
        var oRes = res as ObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.Equal(StatusCodes.Status200OK, oRes!.StatusCode);
    }

    [Fact]
    public async Task GetFree_ShouldReturnAvailableDates()
    {
        _bookingService.Setup(b => b.GetAvailableDates(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<List<DateOnly>>()))
            .ReturnsAsync([]);

        var req = ReqFactory.FreeBookingReq;
        var res = await _controller.GetFree(req);
        var oRes = res as ObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.Equal(StatusCodes.Status200OK, oRes!.StatusCode);
    }

    [Fact]
    public async Task Rooms_ShouldReturnRoomList()
    {
        _bookingService.Setup(b => b.GetRooms())
            .ReturnsAsync([]);

        var res = await _controller.Rooms();
        var oRes = res as ObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.Equal(StatusCodes.Status200OK, oRes!.StatusCode);
    }

    [Fact]
    public async Task Create_ShouldReturn200()
    {
        _bookingService.Setup(b => b.CreateBooking(It.IsAny<string>(), It.IsAny<CreateBookingReq>()))
            .ReturnsAsync(Result.Success(new List<BookingDto> { DtoFactory.BookingDto }));

        var req = ReqFactory.CreateBookingReq;
        var res = await _controller.Create(req);

        var okRes = res as OkObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.IsType<List<BookingDto>>(okRes!.Value);
    }

    [Fact]
    public async Task Create_AlreadyExists_ShouldReturn409()
    {
        _bookingService.Setup(b => b.CreateBooking(It.IsAny<string>(), It.IsAny<CreateBookingReq>()))
            .ReturnsAsync(Result.Failure<List<BookingDto>>(Error.BookingError("test")));

        var req = ReqFactory.CreateBookingReq;
        var res = await _controller.Create(req);
        var confRes = res as ObjectResult;

        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status409Conflict, confRes!.StatusCode);
    }

    [Fact]
    public async Task Edit_ShouldReturn200()
    {
        _bookingService.Setup(b => b.EditBooking(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<EditBookingReq>()))
            .ReturnsAsync(Result.Success());

        var req = ReqFactory.EditBookingReq;
        var res = await _controller.Edit(It.IsAny<int>(), req);

        Assert.IsType<OkResult>(res);
    }

    [Fact]
    public async Task Edit_NotFound_ShouldReturn404()
    {
        _bookingService.Setup(b => b.EditBooking(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<EditBookingReq>()))
            .ReturnsAsync(Result.Failure(Error.BookingNotFound));

        var req = ReqFactory.EditBookingReq;
        var res = await _controller.Edit(It.IsAny<int>(), req);

        var nfRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status404NotFound, nfRes!.StatusCode);
    }

    [Fact]
    public async Task Delete_ShouldReturn204()
    {
        _bookingService.Setup(b => b.DeleteBooking(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Success());

        var res = await _controller.Delete(0);

        Assert.IsType<NoContentResult>(res);
    }

    [Fact]
    public async Task Delete_NotFound_ShouldReturn404()
    {
        _bookingService.Setup(b => b.DeleteBooking(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Failure(Error.BookingNotFound));

        var res = await _controller.Delete(0);

        var nfRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status404NotFound, nfRes!.StatusCode);
    }
}