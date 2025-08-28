using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers.ApiControllers;

/// <summary>
/// Base controller for api controllers. Contains property to grab user id from context, and a method for constructing
/// problem response from Result.
/// </summary>
public abstract class ApiBaseController : ControllerBase
{
    protected string UserId => HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
                               throw new AuthenticationFailureException("User id claim not found");

    protected ObjectResult ProblemResponse(Result result) =>
        Problem(result.Error!.Message, type: result.Error.Type, statusCode: result.Error.Code);
}