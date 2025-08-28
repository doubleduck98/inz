using inz.Server.Data;
using inz.Server.Dtos.Mvc;
using inz.Server.Models;
using inz.Server.ViewModels.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace inz.Server.Services;

public interface IUsersService
{
    /// <summary>
    /// Returns paginated users list supporting search.
    /// </summary>
    public Task<UserListDto> GetUsers(string? search, int page, int pageSize);

    /// <summary>
    /// Method for creating a new user.
    /// </summary>
    public Task<Result> CreateUser(CreateViewModel model);

    /// <summary>
    /// Attempts to retrieve user info.
    /// </summary>
    public Task<Result<UserDto>> GetUser(string id);

    /// <summary>
    /// Method for updating an user.
    /// </summary>
    public Task<Result> UpdateUser(EditUserViewModel model);

    /// <summary>
    /// Method for deleting an user.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public Task DeleteUser(string id);

    /// <summary>
    /// Method for unconditionally setting a new password for specified user.
    /// </summary>
    public Task<Result> ChangePassword(string id, string newPassword);

    /// <summary>
    /// Method for changing a new password for an user. Expects valid old password.
    /// </summary>
    public Task<Result> ChangePassword(string id, string oldPassword, string newPassword);
}

public class UsersService : IUsersService
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;

    public UsersService([FromServices] AppDbContext dbContext, [FromServices] UserManager<User> userManager)
    {
        _db = dbContext;
        _userManager = userManager;
    }

    public async Task<UserListDto> GetUsers(string? search, int page, int pageSize)
    {
        var query = _db.Users.AsQueryable();
        if (!search.IsNullOrEmpty())
        {
            query = query.Where(u =>
                EF.Functions.ILike(u.Name, $"{search!}%") ||
                EF.Functions.ILike(u.Surname, $"{search!}%"));
        }

        var totalUsers = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize);

        var users = await query.OrderBy(u => u.Surname).ThenBy(u => u.Name)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(u => new UserDto(u.Id, u.Name, u.Surname, u.Email ?? "", u.PhoneNumber))
            .ToListAsync();

        return new UserListDto(users, totalPages);
    }

    public async Task<Result> CreateUser(CreateViewModel model)
    {
        var user = new User
        {
            Name = model.Name,
            Surname = model.Surname,
            UserName = model.Email,
            Email = model.Email
        };

        var res = await _userManager.CreateAsync(user, model.Password);
        if (res.Succeeded) return Result.Success();

        if (res.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.DuplicateUserName)))
            return Result.Failure(new AppErrors.DuplicateUserName());
        if (res.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.PasswordMismatch)))
            return Result.Failure(new AppErrors.InvalidPasswordError());

        return Result.Failure(new AppErrors.GenericError());
    }

    public async Task<Result<UserDto>> GetUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        return user == null
            ? Result.Failure<UserDto>(Error.UserNotFound)
            : new UserDto(user.Id, user.Name, user.Surname, user.Email!, user.PhoneNumber);
    }

    public async Task<Result> UpdateUser(EditUserViewModel model)
    {
        var user = await _userManager.FindByIdAsync(model.Id);
        if (user == null) return Result.Failure(new AppErrors.UserNotFound());

        user.Name = model.Name;
        user.Surname = model.Surname;
        user.Email = model.Email;
        user.UserName = model.Email;

        var res = await _userManager.UpdateAsync(user);
        if (res.Succeeded) return Result.Success();
        if (res.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.DuplicateUserName)))
            return Result.Failure(new AppErrors.DuplicateUserName());
        return Result.Failure(new AppErrors.GenericError());
    }

    public async Task DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return;

        await _userManager.DeleteAsync(user);
    }

    public async Task<Result> ChangePassword(string id, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return Result.Failure(new AppErrors.UserNotFound());

        var t = await _userManager.GeneratePasswordResetTokenAsync(user);
        var res = await _userManager.ResetPasswordAsync(user, t, newPassword);
        if (res.Succeeded) return Result.Success();
        if (res.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.PasswordMismatch)))
            return Result.Failure(new AppErrors.InvalidPasswordError());
        return Result.Failure(new AppErrors.GenericError());
    }

    public async Task<Result> ChangePassword(string id, string oldPassword, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return Result.Failure(new AppErrors.UserNotFound());

        var res = await _userManager.ChangePasswordAsync(user, oldPassword, newPassword);
        if (res.Succeeded) return Result.Success();
        if (res.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.PasswordMismatch)))
            return Result.Failure(new AppErrors.InvalidPasswordError());
        return Result.Failure(new AppErrors.GenericError());
    }
}