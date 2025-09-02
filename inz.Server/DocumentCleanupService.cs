using inz.Server.Data;
using inz.Server.Models;
using inz.Server.Services;
using Microsoft.EntityFrameworkCore;

namespace inz.Server;

/// <summary>
/// A background service that removes any documents that have been deleted more than 30 days prior.
/// </summary>
public class DocumentCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScope;
    private readonly PeriodicTimer _timer = new(TimeSpan.FromHours(24));

    public DocumentCleanupService(IServiceScopeFactory serviceScope)
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
                var documentsRepository = scope.ServiceProvider.GetRequiredService<IDocumentsRepository>();
                var expired = DateTime.UtcNow.Subtract(TimeSpan.FromDays(30));

                var toDelete = await dbContext.Documents.IgnoreQueryFilters()
                    .Where(d => d.DeletedOnUtc != null && d.DeletedOnUtc < expired)
                    .ToListAsync(cancellationToken);

                if (toDelete.Count != 0)
                {
                    var removed = new List<Document>();
                    foreach (var doc in toDelete)
                    {
                        try
                        {
                            await documentsRepository.DeleteDocument(doc.OwnerId!, doc.SourcePath);
                            removed.Add(doc);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine(e);
                        }
                    }
                    
                    dbContext.RemoveRange(removed);
                    await dbContext.SaveChangesAsync(cancellationToken);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            await _timer.WaitForNextTickAsync(cancellationToken);
        }
    }
}