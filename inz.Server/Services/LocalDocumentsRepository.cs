using System.Security.Cryptography;
using System.Text;

namespace inz.Server.Services;

public interface IDocumentsRepository
{
    public Task<bool> DocumentExists(string path);
    public Task<Stream> GetDocument(string path);
    public Task<string> SaveDocument(string userId, IFormFile file);
    public Task SoftDeleteDocument(string path);
}

public class LocalDocumentsRepository : IDocumentsRepository
{
    private readonly string _dir;

    public LocalDocumentsRepository(IConfiguration config)
    {
        _dir = config["Storage"] ?? throw new InvalidOperationException();
    }
    
    public Task<bool> DocumentExists(string path)
    {
        return Task.FromResult(File.Exists(path));
    }

    public Task<Stream> GetDocument(string path)
    {
        return Task.FromResult<Stream>(new FileStream(path, FileMode.Open));
    }

    public async Task<string> SaveDocument(string userId, IFormFile file)
    {
        var path = Path.Combine(_dir, userId);
        Directory.CreateDirectory(Path.Combine(_dir, userId));

        var filename = new StringBuilder().Append(DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:sszzz_"));
        foreach (var b in MD5.HashData(Encoding.UTF8.GetBytes(file.FileName)))
            filename.Append(b.ToString("X2"));
        var filepath = Path.Combine(path, filename.ToString());

        await using var fs = new FileStream(filepath, FileMode.Create);
        await file.CopyToAsync(fs);
        return filepath;
    }

    public Task SoftDeleteDocument(string path)
    {
        File.Move(path, Path.Combine(
            Path.GetDirectoryName(path) ?? "", "DELETED_" + Path.GetFileName(path)));
        return Task.CompletedTask;
    }
}