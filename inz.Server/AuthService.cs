using inz.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace inz.Server;

public interface IAuthService
{
    public Task<User?> FindUserByEmailAsync(string email);
    public Task<bool> VerifyUserAsync(User user, string password);
    public string GetAuthToken(User user);
    public Task<string> GetRefreshTokenAsync(User user);
    public Task<User?> FindTokenOwnerAsync(string token);
    public Task<Result<string>> RefreshTokenAsync(User user, string token);
    public Task InvalidateUserToken(User user);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly UserManager<User> _userManager;
    private readonly ITokenProvider _tokenProvider;
    private readonly AuthDbContext _authDbContext;

    public AuthService(IConfiguration configuration, UserManager<User> userManager, ITokenProvider tokenProvider,
        AuthDbContext authDbContext)
    {
        _configuration = configuration;
        _userManager = userManager;
        _tokenProvider = tokenProvider;
        _authDbContext = authDbContext;
    }

    public async Task<User?> FindUserByEmailAsync(string email)
    {
        return await _userManager.FindByEmailAsync(email);
    }

    public Task<User?> FindUserByNameAsync(string name)
    {
        return _userManager.FindByNameAsync(name);
    }

    public async Task<bool> VerifyUserAsync(User user, string password)
    {
        return await _userManager.CheckPasswordAsync(user, password);
    }

    public string GetAuthToken(User user)
    {
        // todo: claims
        return _tokenProvider.Create();
    }

    public async Task<string> GetRefreshTokenAsync(User user)
    {
        // todo: token expired
        var t = await _userManager.GetAuthenticationTokenAsync(user, "jwt", "refreshToken");
        return t!;
    }

    public async Task<User?> FindTokenOwnerAsync(string token)
    {
        var q = await _authDbContext.Users.Join(
                _authDbContext.UserTokens,
                user => user.Id,
                userToken => userToken.UserId,
                (user, t) => new { User = user, Token = t.Value })
            .SingleOrDefaultAsync(u => u.Token == token);
        return q?.User;
    }

    public async Task<Result<string>> RefreshTokenAsync(User user, string token)
    {
        var valid = await _userManager.VerifyUserTokenAsync(user, "jwt", "refreshToken", token);
        if (!valid) return Result<string>.Failure("Token not valid.");

        await _userManager.RemoveAuthenticationTokenAsync(user, "jwt", "refreshToken");
        var newToken = await _userManager.GenerateUserTokenAsync(user, "jwt", "refreshToken");
        await _userManager.SetAuthenticationTokenAsync(user, "jwt", "refreshToken", newToken);
        return Result<string>.Success(newToken);
    }

    public async Task InvalidateUserToken(User user)
    {
        await _userManager.UpdateSecurityStampAsync(user);
    }
}