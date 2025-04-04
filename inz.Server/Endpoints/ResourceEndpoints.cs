namespace inz.Server.Endpoints;

public static class ResourceEndpoints
{
    public static void MapResourceEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGroup("Resources")
            .MapResourceApi()
            .DisableAntiforgery()
            //.RequireAuthorization()
            ;
    }
    
    private static RouteGroupBuilder MapResourceApi(this RouteGroupBuilder group)
    {
        group.MapPost("Create", CreateDocument);
        
        return group;
    }

    private static async Task<IResult> CreateDocument(IFormFile file)
    {
        return Results.Created();
    }
}