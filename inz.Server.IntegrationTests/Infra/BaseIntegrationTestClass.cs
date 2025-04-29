using inz.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace inz.Server.IntegrationTests.Infra;

public class BaseIntegrationTestClass : IClassFixture<IntegrationTestWebAppFactory>, IAsyncLifetime
{
    private readonly TestDataSeeder _seeder;

    protected readonly HttpClient Client;
    protected readonly AppDbContext DbContext;
    protected readonly string TestUserId;
    protected readonly string TestDir;

    protected BaseIntegrationTestClass(IntegrationTestWebAppFactory factory)
    {
        Client = factory.CreateClient();

        var scope = factory.Services.CreateScope();
        DbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (DbContext.Database.GetPendingMigrations().Any())
        {
            DbContext.Database.Migrate();
        }
        
        _seeder = new TestDataSeeder(DbContext);
        
        TestDir = factory.TestDir;
        TestUserId = IntegrationTestWebAppFactory.TestUserId;
    }
    
    public Task InitializeAsync()
    {
        return _seeder.SeedData();
    }

    public Task DisposeAsync()
    {
        return _seeder.WipeData();
    }
}