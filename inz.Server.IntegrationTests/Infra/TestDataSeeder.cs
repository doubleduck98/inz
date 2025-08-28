using inz.Server.Data;
using inz.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.IntegrationTests.Infra;

public class TestDataSeeder
{
    private readonly AppDbContext _dbContext;
    private readonly string _userId;
    private readonly int _patientId;

    public TestDataSeeder(AppDbContext dbContext, string userId, int patientId)
    {
        _dbContext = dbContext;
        _userId = userId;
        _patientId = patientId;
    }

    public async Task SeedData()
    {
        var user = await SeedUser();
        await SeedPatient(user);

        await _dbContext.SaveChangesAsync();
    }

    private async Task<User> SeedUser()
    {
        var user = new User
        {
            Id = _userId,
            Name = "Test",
            Surname = "Test",
            Email = "test@test.test",
            UserName = "test@test.test"
        };
        await _dbContext.Users.AddAsync(user);
        return user;
    }

    private async Task SeedPatient(User user)
    {
        var patient = new Patient
        {
            Id = _patientId,
            CoordinatingUser = user,
            Name = "test",
            Surname = "test",
            Dob = default,
            Street = "test",
            House = "test",
            ZipCode = "test",
            Province = "test",
            City = "test"
        };
        await _dbContext.Patients.AddAsync(patient);
    }

    public async Task WipeData()
    {
        await _dbContext.Database.ExecuteSqlAsync($"delete from public.\"AspNetUsers\";");
        await _dbContext.Database.ExecuteSqlAsync($"delete from public.\"Documents\";");
        await _dbContext.Database.ExecuteSqlAsync($"delete from public.\"Patients\";");
    }
}