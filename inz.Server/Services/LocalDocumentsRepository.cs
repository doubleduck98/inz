using inz.Server.Data;
using inz.Server.Dtos.Resources;
using inz.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.Services;

public interface IDocumentsService
{
    public Task<Result<FileStream>> GetFile(string userId, string fileName);
    public Task<Result<DocumentDto>> GetFileMetadata(string userId, string fileName);
    public Task<Result<DocumentDto>> GetFileMetadataById(string userId, int id);
    public Task<List<DocumentDto>> GetFilesForUser(string userId);
    public Task<Result<DocumentDto>> SaveDocument(string userId, IFormFile file);
    public Task<Result> EditDocument(string userId, int id, string newName);
    public Task<Result> DeleteDocument(string userId, int id);
}

public class LocalDocumentsService : IDocumentsService
{
    private readonly AppDbContext _db;

    public LocalDocumentsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Result<FileStream>> GetFile(string userId, string fileName)
    {
        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.FileName == fileName && d.OwnerId == userId);
        if (doc == null) return Result.Failure<FileStream>(Error.FileNotFound);
        return Path.Exists(doc.SourcePath)
            ? File.OpenRead(doc.SourcePath)
            : Result.Failure<FileStream>(Error.FileNotPresent);
    }

    public async Task<Result<DocumentDto>> GetFileMetadata(string userId, string fileName)
    {
        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.FileName == fileName && d.OwnerId == userId);
        return doc != null
            ? DocumentDto.Create(doc.Id, doc.FileName, doc.FileType)
            : Result.Failure<DocumentDto>(Error.FileNotFound);
    }

    public async Task<Result<DocumentDto>> GetFileMetadataById(string userId, int id)
    {
        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.Id == id && d.OwnerId == userId);
        return doc != null
            ? DocumentDto.Create(doc.Id, doc.FileName, doc.FileType)
            : Result.Failure<DocumentDto>(Error.FileNotFound);
    }

    public async Task<List<DocumentDto>> GetFilesForUser(string userId)
    {
        return await _db.Documents.Where(d => d.OwnerId == userId)
            .Select(doc => DocumentDto.Create(doc.Id, doc.FileName, doc.FileType))
            .ToListAsync();
    }

    public async Task<Result<DocumentDto>> SaveDocument(string userId, IFormFile file)
    {
        var path = "/tmp/inz/" + file.FileName;
        // if (File.Exists(path)) return Result<Document>.Failure(Error.FileExists);
        // todo subdirectories

        try
        {
            await using var fs = new FileStream(path, FileMode.OpenOrCreate);
            await file.CopyToAsync(fs);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return Result.Failure<DocumentDto>(new Error(e.Message));
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

        return DocumentDto.Create(doc.Id, doc.FileName, doc.FileType);
    }

    public async Task<Result> EditDocument(string userId, int id, string newName)
    {
        var doc = await _db.Documents.SingleOrDefaultAsync(d => d.Id == id && d.OwnerId == userId);
        if (doc == null) return Result.Failure(Error.FileNotFound);

        doc.FileName = newName;
        doc.LastEditUtc = DateTime.UtcNow;
        _db.Documents.Update(doc);
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> DeleteDocument(string userId, int id)
    {
        var doc = await _db.Documents.SingleOrDefaultAsync(d => d.Id == id && d.OwnerId == userId);
        if (doc == null) return Result.Failure(Error.FileNotFound);

        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync();
        return Result.Success();
    }
}