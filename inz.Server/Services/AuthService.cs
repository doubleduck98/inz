using System.Security.Claims;
using inz.Server.Data;
using inz.Server.Dtos.Auth;
using inz.Server.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.Services;

public interface IAuthService
{
    /// <summary>
    /// Attempts to log in a user with provided credentials.
    /// </summary>
    public Task<Result<LoginResp>> LoginAsync(string email, string password);

    /// <summary>
    /// Method to refresh a token. Stores new refresh token in the database.
    /// </summary>
    /// <param name="token">Refresh token to be refreshed</param>
    public Task<Result<RefreshResp>> RefreshTokenAsync(string token);

    /// <summary>
    /// Invalidates every refresh token of a given user and signs user out.
    /// </summary>
    public Task<Result> InvalidateUserTokenAsync(string userId, string token, HttpContext httpContext);

    /// <summary>
    /// Invalidates every refresh token of a given user.
    /// </summary>
    public Task InvalidateAllUserTokensAsync(string userId);

    /// <summary>
    /// Attempts to log user in with given credentials. Creates Principal object and stores it in a cookie.
    /// </summary>
    public Task<Result> SignIn(string email, string password, HttpContext context);

    /// <summary>
    /// Method to return a new pair of access and refresh token with credentials of user whose id is provided.
    /// </summary>
    public Task<LoginResp> LoginWithToken(string userId);
}

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenProvider _tokenProvider;
    private readonly AppDbContext _db;

    public AuthService(UserManager<User> userManager, ITokenProvider tokenProvider, AppDbContext appDbContext)
    {
        _userManager = userManager;
        _tokenProvider = tokenProvider;
        _db = appDbContext;
    }

    public async Task<Result<LoginResp>> LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return Result.Failure<LoginResp>(Error.AuthenticationFailed);

        var authenticated = await _userManager.CheckPasswordAsync(user, password);
        if (!authenticated) return Result.Failure<LoginResp>(Error.AuthenticationFailed);

        var claims = await _userManager.GetClaimsAsync(user);
        var token = _tokenProvider.CreateToken(user, claims);

        var refreshToken = _tokenProvider.CreateRefreshToken();
        await _db.RefreshTokens.AddAsync(new RefreshToken
            { User = user, Value = refreshToken, ExpiresAtUtc = DateTime.UtcNow.AddDays(7) });
        await _db.SaveChangesAsync();

        return new LoginResp(user.Name, user.Surname, user.Email ?? "", token, refreshToken);
    }

    public async Task<Result<RefreshResp>> RefreshTokenAsync(string token)
    {
        var t = await _db.RefreshTokens.Include(t => t.User).SingleOrDefaultAsync(t => t.Value == token);
        if (t == null) return Result.Failure<RefreshResp>(Error.InvalidToken);
        if (t.ExpiresAtUtc < DateTime.UtcNow) return Result.Failure<RefreshResp>(Error.TokenExpired);

        var newRefresh = _tokenProvider.CreateRefreshToken();
        t.Value = newRefresh;
        t.ExpiresAtUtc = DateTime.UtcNow.AddDays(7);
        _db.RefreshTokens.Update(t);
        await _db.SaveChangesAsync();

        var claims = await _userManager.GetClaimsAsync(t.User);
        var newToken = _tokenProvider.CreateToken(t.User, claims);

        return new RefreshResp(newToken, newRefresh);
    }

    public async Task<Result> InvalidateUserTokenAsync(string userId, string token, HttpContext httpContext)
    {
        var t = await _db.RefreshTokens.SingleOrDefaultAsync(t => t.Value == token);
        if (t == null) return Result.Failure(Error.InvalidToken);
        if (t.UserId != userId) return Result.Failure<string>(Error.InvalidToken);

        _db.RefreshTokens.Remove(t);
        await _db.SaveChangesAsync();
        await httpContext.SignOutAsync();
        return Result.Success();
    }

    public async Task InvalidateAllUserTokensAsync(string userId)
    {
        var tokens = _db.RefreshTokens.Where(t => t.UserId == userId);
        if (tokens.Any())
        {
            _db.RefreshTokens.RemoveRange(tokens);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<Result> SignIn(string email, string password, HttpContext context)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return Result.Failure<LoginResp>(Error.AuthenticationFailed);

        var authenticated = await _userManager.CheckPasswordAsync(user, password);
        if (!authenticated) return Result.Failure<LoginResp>(Error.AuthenticationFailed);

        var claims = new List<Claim> { new("userId", user.Id) };
        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        return Result.Success();
    }

    public async Task<LoginResp> LoginWithToken(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) throw new AuthenticationFailureException("Authenticated user doesn't exist");

        var claims = await _userManager.GetClaimsAsync(user);
        var token = _tokenProvider.CreateToken(user, claims);

        var refreshToken = _tokenProvider.CreateRefreshToken();
        await _db.RefreshTokens.AddAsync(new RefreshToken
            { User = user, Value = refreshToken, ExpiresAtUtc = DateTime.UtcNow.AddDays(7) });
        await _db.SaveChangesAsync();

        return new LoginResp(user.Name, user.Surname, user.Email ?? "", token, refreshToken);
    }
}