using inz.Server.Data;

namespace inz.Server;

public class TokenCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScope;
    private readonly PeriodicTimer _timer = new(TimeSpan.FromHours(24));
    
    public TokenCleanupService(IServiceScopeFactory serviceScope)
    {
        _serviceScope = serviceScope;
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceScope.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var expiredTokens = dbContext.RefreshTokens.Where(t => t.ExpiresAtUtc < DateTime.UtcNow);
                dbContext.RemoveRange(expiredTokens);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            await _timer.WaitForNextTickAsync(cancellationToken);
        }
    }
}