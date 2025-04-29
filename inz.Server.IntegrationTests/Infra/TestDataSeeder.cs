using inz.Server.Data;
using inz.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.IntegrationTests.Infra;

public class TestDataSeeder
{
    private readonly AppDbContext _dbContext;

    public TestDataSeeder(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task SeedData()
    {
        await SeedUser();

        await _dbContext.SaveChangesAsync();
    }

    private async Task SeedUser()
    {
        var users = new[]
        {
            new User
            {
                Id = "12345678-1234-1234-1234-123456789012"
            }
        };
        await _dbContext.Users.AddRangeAsync(users);
    }

    public async Task WipeData()
    {
        await _dbContext.Database.ExecuteSqlAsync($"delete from public.\"AspNetUsers\";");
        await _dbContext.Database.ExecuteSqlAsync($"delete from public.\"Documents\";");
    }
}