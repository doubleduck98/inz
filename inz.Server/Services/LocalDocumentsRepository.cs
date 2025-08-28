namespace inz.Server.Services;

public interface IDocumentsRepository
{
    /// <summary>
    /// Returns boolean value whether a file exists on file system.
    /// </summary>
    public Task<bool> DocumentExists(string userId, string path);

    /// <summary>
    /// Returns a file stream of a file stored in file system.
    /// </summary>
    public Task<Stream> GetDocument(string userId, string path);

    /// <summary>
    /// Attempts to save a document in file system.
    /// </summary>
    public Task<string> SaveDocument(string userId, IFormFile file, string fileName);

    /// <summary>
    /// Attempts to rename a document stored in file system.
    /// </summary>
    public Task<string> RenameDocument(string userId, string path, string newName);

    /// <summary>
    /// Attempts to perform a soft-delete on a document by marking it with DELETED_ name prefix.
    /// </summary>
    public Task<string> SoftDeleteDocument(string userId, string path);

    /// <summary>
    /// Restores previously soft-deleted document by removing DELETED_ name prefix.
    /// </summary>
    public Task<string> RestoreDocument(string userId, string path, string newFileName);

    /// <summary>
    /// Attempts to remove a document from file system.
    /// </summary>
    public Task DeleteDocument(string userId, string path);
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

    public async Task<string> SaveDocument(string userId, IFormFile file, string fileName)
    {
        // create directory if it doesn't exist
        var dirPath = Path.Combine(_dir, userId);
        Directory.CreateDirectory(dirPath);

        // create path storage/userId/fileName and save file
        var filePath = Path.Combine(dirPath, fileName);
        await using var fs = new FileStream(filePath, FileMode.CreateNew);
        await file.CopyToAsync(fs);

        // return name for database storage
        return fileName;
    }

    public Task<string> RenameDocument(string userId, string path, string newName)
    {
        var oldPath = Path.Combine(_dir, userId, path);
        var newPath = Path.Combine(_dir, userId, newName);
        File.Move(oldPath, newPath);
        return Task.FromResult(newName);
    }

    public Task<string> SoftDeleteDocument(string userId, string path)
    {
        var oldPath = Path.Combine(_dir, userId, path);
        var newHash = "DELETED_" + DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:sszzz_") + path;
        var newPath = Path.Combine(_dir, userId, newHash);
        File.Move(oldPath, newPath);
        return Task.FromResult(newHash);
    }

    public Task<string> RestoreDocument(string userId, string path, string newFileName)
    {
        var oldPath = Path.Combine(_dir, userId, path);
        var newPath = Path.Combine(_dir, userId, newFileName);
        File.Move(oldPath, newPath);
        return Task.FromResult(newFileName);
    }

    public Task DeleteDocument(string userId, string path)
    {
        var filePath = Path.Combine(_dir, userId, path);
        File.Delete(filePath);
        return Task.CompletedTask;
    }
}