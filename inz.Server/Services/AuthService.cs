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
    public Task<Result<LoginResp>> LoginAsync(string email, string password);
    public Task<Result<RefreshResp>> RefreshTokenAsync(string token);
    public Task<Result> InvalidateUserTokenAsync(string userId, string token);
    public Task InvalidateAllUserTokensAsync(string userId);
    public void SetCookie(HttpResponse response, string token);

    public Task<Result> SignIn(string email, string password, HttpContext context);
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

        return new LoginResp(new UserDto(user.Name ?? "", user.Surname ?? "", user.Email ?? "", refreshToken), token);
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

    public async Task<Result> InvalidateUserTokenAsync(string userId, string token)
    {
        var t = await _db.RefreshTokens.SingleOrDefaultAsync(t => t.Value == token);
        if (t == null) return Result.Failure(Error.InvalidToken);
        if (t.UserId != userId) return Result.Failure<string>(Error.InvalidToken);

        _db.RefreshTokens.Remove(t);
        await _db.SaveChangesAsync();
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

    public void SetCookie(HttpResponse response, string token)
    {
        response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            // Secure = true,
            SameSite = SameSiteMode.Strict
        });
    }

    public async Task<Result> SignIn(string email, string password, HttpContext context)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return Result.Failure<LoginResp>(Error.AuthenticationFailed);

        var authenticated = await _userManager.CheckPasswordAsync(user, password);
        if (!authenticated) return Result.Failure<LoginResp>(Error.AuthenticationFailed);

        var claims = await _userManager.GetClaimsAsync(user);
        claims.Add(new Claim("userId", user.Id));
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

        return new LoginResp(new UserDto(user.Name ?? "", user.Surname ?? "", user.Email ?? "", refreshToken), token);
    }
}