using System.Security.Cryptography;
using System.Text;

namespace inz.Server.Services;

public interface IDocumentsRepository
{
    public Task<bool> DocumentExists(string userId, string path);
    public Task<Stream> GetDocument(string userId, string path);
    public Task<string> SaveDocument(string userId, IFormFile file);
    public Task<string> SoftDeleteDocument(string userId, string path);
    public Task<string> RestoreDocument(string userId, string path);
}

public class LocalDocumentsRepository : IDocumentsRepository
{
    private readonly string _dir;

    public LocalDocumentsRepository(IConfiguration config)
    {
        _dir = config["Storage"] ?? throw new InvalidOperationException();
    }

    public Task<bool> DocumentExists(string userId, string path)
    {
        return Task.FromResult(File.Exists(Path.Combine(_dir, userId, path)));
    }

    public Task<Stream> GetDocument(string userId, string path)
    {
        return Task.FromResult<Stream>(new FileStream(Path.Combine(_dir, userId, path), FileMode.Open));
    }

    public async Task<string> SaveDocument(string userId, IFormFile file)
    {
        // create directory if it doesn't exist
        var dirPath = Path.Combine(_dir, userId);
        Directory.CreateDirectory(dirPath);

        // calculate filename hash
        var fileNameHash = new StringBuilder();
        foreach (var b in MD5.HashData(Encoding.UTF8.GetBytes(file.FileName)))
            fileNameHash.Append(b.ToString("X2"));

        // create path storage/userId/fileHash and save file
        var filePath = Path.Combine(dirPath, fileNameHash.ToString());
        await using var fs = new FileStream(filePath, FileMode.CreateNew);
        await file.CopyToAsync(fs);

        // return hash for database storage
        return fileNameHash.ToString();
    }

    public Task<string> SoftDeleteDocument(string userId, string path)
    {
        var oldPath = Path.Combine(_dir, userId, path);
        var newHash = "DELETED_" + DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:sszzz_") + path;
        var newPath = Path.Combine(_dir, userId, newHash);
        File.Move(oldPath, newPath);
        return Task.FromResult(newHash);
    }

    public Task<string> RestoreDocument(string userId, string path)
    {
        var oldPath = Path.Combine(_dir, userId, path);
        var newHash = path.Split("_",3).Last();
        var newPath = Path.Combine(_dir, userId, newHash);
        File.Move(oldPath, newPath);
        return Task.FromResult(newHash);
    }
}