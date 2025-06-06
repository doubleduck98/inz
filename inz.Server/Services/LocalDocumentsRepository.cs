namespace inz.Server.Services;

public interface IDocumentsRepository
{
    public Task<bool> DocumentExists(string userId, string path);
    public Task<Stream> GetDocument(string userId, string path);
    public Task<string> SaveDocument(string userId, IFormFile file, string fileName);
    public Task<string> RenameDocument(string userId, string path, string newName);
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

    public async Task<string> SaveDocument(string userId, IFormFile file, string fileName)
    {
        // create directory if it doesn't exist
        var dirPath = Path.Combine(_dir, userId);
        Directory.CreateDirectory(dirPath);

        // *zostawiam dla potomnych*
        // calculate filename hash
        // var fileNameHash = new StringBuilder();
        // foreach (var b in MD5.HashData(Encoding.UTF8.GetBytes(fileName)))
        //     fileNameHash.Append(b.ToString("X2"));

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

    public Task<string> RestoreDocument(string userId, string path)
    {
        var oldPath = Path.Combine(_dir, userId, path);
        var newHash = path.Split("_",3).Last();
        var newPath = Path.Combine(_dir, userId, newHash);
        File.Move(oldPath, newPath);
        return Task.FromResult(newHash);
    }
}