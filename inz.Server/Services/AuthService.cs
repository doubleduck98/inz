using inz.Server.Data;
using inz.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.Services;

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
    private readonly AppDbContext _db;

    public AuthService(UserManager<User> userManager, ITokenProvider tokenProvider, AppDbContext appDbContext)
    {
        _userManager = userManager;
        _tokenProvider = tokenProvider;
        _db = appDbContext;
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
        await _db.RefreshTokens.AddAsync(new RefreshToken
            { User = user, Value = token, ExpiresAtUtc = DateTime.UtcNow.AddDays(7) });
        await _db.SaveChangesAsync();
        return token;
    }

    public async Task<User> FindTokenOwnerAsync(string token)
    {
        var t = await _db.RefreshTokens.Include(rt => rt.User)
            .SingleAsync(rt => rt.Value == token);
        return t.User;
    }

    public async Task<Result<string>> RefreshTokenAsync(string token)
    {
        var t = await _db.RefreshTokens.SingleOrDefaultAsync(t => t.Value == token);
        if (t == null) return Result<string>.Failure(Error.InvalidToken);
        if (t.ExpiresAtUtc < DateTime.UtcNow) return Result<string>.Failure(Error.TokenExpired);

        var newtoken = _tokenProvider.CreateRefreshToken();
        t.Value = newtoken;
        t.ExpiresAtUtc = DateTime.UtcNow.AddDays(7);
        _db.RefreshTokens.Update(t);
        await _db.SaveChangesAsync();
        return Result<string>.Success(newtoken);
    }

    public async Task<Result<string>> InvalidateUserTokenAsync(string userId, string token)
    {
        var t = await _db.RefreshTokens.SingleOrDefaultAsync(t => t.Value == token);
        if (t == null) return Result<string>.Failure(Error.InvalidToken);
        if (t.UserId != userId) return Result<string>.Failure(Error.InvalidToken);

        _db.RefreshTokens.Remove(t);
        await _db.SaveChangesAsync();
        return Result<string>.Success(null!);
    }

    public async Task InvalidateAllUserTokensAsync(string userId)
    {
        var user = await _db.Users.Include(u => u.RefreshTokens)
            .SingleAsync(u => u.Id == userId);
        user.RefreshTokens.Clear();
        await _db.SaveChangesAsync();
    }
}