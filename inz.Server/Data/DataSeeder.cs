using inz.Server.Models;
using Microsoft.AspNetCore.Identity;

namespace inz.Server.Data;

public static class DataSeeder
{
    /// <summary>
    /// Seeds initial roles for app users. Currently also adds a dummy admin user.
    /// </summary>
    /// <param name="serviceProvider"></param>
    public static async Task SeedInitial(IServiceProvider serviceProvider)
    {
        try
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            const string adminUserId = "A574250E-918B-40B0-B45F-1F46DA2BDDB3";

            var exists = await roleManager.RoleExistsAsync("Admin");
            if (!exists)
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            const string adminEmail = "admin@example.com";
            var hasher = new PasswordHasher<IdentityUser>();
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser != null) return;
            var newAdmin = new User
            {
                Name = "Admin",
                Surname = "Admin",
                Id = adminUserId,
                UserName = adminEmail,
                Email = adminEmail,
                PasswordHash = hasher.HashPassword(null!, "Admin123@"),
            };
            await userManager.CreateAsync(newAdmin, "Admin123@");
            await userManager.AddToRoleAsync(newAdmin, "Admin");
        }
        catch
        {
            // ignored
        }
    }
}