using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers;

public abstract class ApiBaseController : ControllerBase
{
    protected string UserId => HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ??
                               throw new AuthenticationFailureException("User id claim not found");

    protected ObjectResult ProblemResponse(Result result) =>
        Problem(result.Error!.Message, type: result.Error.Type, statusCode: result.Error.Code);
}