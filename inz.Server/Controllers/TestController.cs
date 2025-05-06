using inz.Server.Dtos.Auth;
using inz.Server.Models;
using Microsoft.AspNetCore.Identity;

namespace inz.Server.Controllers;

public static class TestController
{
    public static void MapTestEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/Test", Test).RequireAuthorization();
        app.MapPost("AddDummy", AddDummy);
    }

    private static IResult Test()
    {
        return Results.Ok();
    }

    private static async Task<IResult> AddDummy(LoginReq req, UserManager<User> manager)
    {
        var u = new User { Name = "test", UserName = "szipi", Email = req.Email };
        await manager.CreateAsync(u);
        await manager.AddPasswordAsync(u, req.Password);
        return Results.Created();
    }
}