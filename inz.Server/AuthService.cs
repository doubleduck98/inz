using inz.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace inz.Server;

public interface IAuthService
{
    public Task<User?> FindUserByEmailAsync(string email);
    public Task<bool> VerifyUserAsync(User user, string password);
    public Task<string> GetAuthTokenAsync(User user);
    public Task<string> GetRefreshTokenAsync(User user);
    public Task<User> FindTokenOwnerAsync(string token);
    public Task<Result<string>> RefreshTokenAsync(string token);
    public Task<Result<string>> InvalidateUserTokenAsync(string userId, string token);
    public Task InvalidateAllUserTokensAsync(string userId);
}

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenProvider _tokenProvider;
    private readonly AuthDbContext _authDbContext;

    public AuthService(UserManager<User> userManager, ITokenProvider tokenProvider, AuthDbContext authDbContext)
    {
        _userManager = userManager;
        _tokenProvider = tokenProvider;
        _authDbContext = authDbContext;
    }

    public async Task<User?> FindUserByIdAsync(string id)
    {
        return await _userManager.FindByIdAsync(id);
    }

    public async Task<User?> FindUserByEmailAsync(string email)
    {
        return await _userManager.FindByEmailAsync(email);
    }

    public async Task<bool> VerifyUserAsync(User user, string password)
    {
        return await _userManager.CheckPasswordAsync(user, password);
    }

    public async Task<string> GetAuthTokenAsync(User user)
    {
        var claims = await _userManager.GetClaimsAsync(user);
        return _tokenProvider.CreateToken(user, claims);
    }

    public async Task<string> GetRefreshTokenAsync(User user)
    {
        var token = _tokenProvider.CreateRefreshToken();
        await _authDbContext.RefreshTokens.AddAsync(new RefreshToken
            { User = user, Value = token, ExpiresAtUtc = DateTime.UtcNow.AddDays(7) });
        await _authDbContext.SaveChangesAsync();
        return token;
    }

    public async Task<User> FindTokenOwnerAsync(string token)
    {
        var t = await _authDbContext.RefreshTokens.Include(rt => rt.User)
            .SingleAsync(rt => rt.Value == token);
        return t.User;
    }

    public async Task<Result<string>> RefreshTokenAsync(string token)
    {
        var t = await _authDbContext.RefreshTokens.SingleOrDefaultAsync(t => t.Value == token);
        if (t == null) return Result<string>.Failure(Error.InvalidToken);
        if (t.ExpiresAtUtc < DateTime.UtcNow) return Result<string>.Failure(Error.TokenExpired);

        var newtoken = _tokenProvider.CreateRefreshToken();
        t.Value = newtoken;
        t.ExpiresAtUtc = DateTime.UtcNow.AddDays(7);
        _authDbContext.RefreshTokens.Update(t);
        await _authDbContext.SaveChangesAsync();
        return Result<string>.Success(newtoken);
    }

    public async Task<Result<string>> InvalidateUserTokenAsync(string userId, string token)
    {
        var t = await _authDbContext.RefreshTokens.SingleOrDefaultAsync(t => t.Value == token);
        if (t == null) return Result<string>.Failure(Error.InvalidToken);
        if (t.UserId != userId) return Result<string>.Failure(Error.InvalidToken);

        _authDbContext.RefreshTokens.Remove(t);
        await _authDbContext.SaveChangesAsync();
        return Result<string>.Success(null!);
    }

    public async Task InvalidateAllUserTokensAsync(string userId)
    {
        var user = await _authDbContext.Users.Include(u => u.RefreshTokens)
            .SingleAsync(u => u.Id == userId);
        user.RefreshTokens.Clear();
        await _authDbContext.SaveChangesAsync();
    }
}