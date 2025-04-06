using inz.Server.Data;
using inz.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.Services;

public interface IDocumentsRepository
{
    public Task<FileStream> GetFile(string userId, string fileName);
    public Task<Document> GetFileMetadata(string userId, string fileName);
    public Task<Result<Document>> GetFileMetadataById(string userId, int id);
    public Task<List<Document>> GetFilesForUser(string userId);
    public Task<Result<Document>> SaveDocument(string userId, IFormFile file);
    public Task DeleteDocument(string userId, int id);
}

public class LocalDocumentsRepository : IDocumentsRepository
{
    private readonly AppDbContext _db;

    public LocalDocumentsRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<FileStream> GetFile(string userId, string fileName)
    {
        var doc = await _db.Documents.FirstAsync(d => d.FileName == fileName && d.OwnerId == userId);
        return File.OpenRead(doc.SourcePath);
    }

    public async Task<Document> GetFileMetadata(string userId, string fileName)
    {
        var doc = await _db.Documents.FirstAsync(d => d.FileName == fileName && d.OwnerId == userId);
        return doc;
    }

    public async Task<Result<Document>> GetFileMetadataById(string userId, int id)
    {
        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.Id == id && d.OwnerId == userId);
        return doc == null ? Result.Success(doc!) : Result.Failure<Document>(Error.FileNotFound);
    }

    public async Task<List<Document>> GetFilesForUser(string userId)
    {
        return await _db.Documents.Where(d => d.OwnerId == userId).ToListAsync();
    }

    public async Task<Result<Document>> SaveDocument(string userId, IFormFile file)
    {
        var path = "/tmp/inz/" + file.FileName;
        // if (File.Exists(path)) return Result<Document>.Failure(Error.FileExists);
        // todo duplicates + subdirectories

        try
        {
            await using var fs = new FileStream(path, FileMode.OpenOrCreate);
            await file.CopyToAsync(fs);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return Result.Failure<Document>(new Error(e.Message));
        }

        var user = await _db.Users.SingleAsync(u => u.Id == userId);
        var doc = new Document
        {
            User = user,
            FileName = file.FileName,
            FileType = FileType.Unknown,
            SourcePath = path,
            AddedOnUtc = DateTime.UtcNow,
            LastEditUtc = DateTime.UtcNow
        };
        await _db.Documents.AddAsync(doc);
        await _db.SaveChangesAsync();

        return Result.Success<Document>(null!);
    }

    public async Task DeleteDocument(string userId, int id)
    {
        var doc = await _db.Documents.SingleAsync(d => d.Id == id && d.OwnerId == userId);
        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync();
    }
}