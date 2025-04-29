using inz.Server.Data;
using inz.Server.Dtos.Resources;
using inz.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.Services;

public interface IDocumentsService
{
    public Task<Result<Stream>> GetFile(string userId, string fileName);
    public Task<Result<DocumentDto>> GetFileMetadata(string userId, string fileName);
    public Task<Result<DocumentDto>> GetFileMetadataById(string userId, int id);
    public Task<List<DocumentDto>> GetFilesForUser(string userId);
    public Task<Result<DocumentDto>> SaveDocument(string userId, IFormFile file);
    public Task<Result> EditDocument(string userId, int id, string newName);
    public Task<Result> DeleteDocument(string userId, int id);
    public Task<Result> RestoreDocument(string userId, int id);
}

public class DocumentsService : IDocumentsService
{
    private readonly AppDbContext _db;
    private readonly IDocumentsRepository _documents;

    public DocumentsService(AppDbContext db, IDocumentsRepository documents)
    {
        _db = db;
        _documents = documents;
    }

    public async Task<Result<Stream>> GetFile(string userId, string fileName)
    {
        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.FileName == fileName && d.OwnerId == userId);
        if (doc == null) return Result.Failure<Stream>(Error.FileNotFound);
        return await _documents.DocumentExists(userId, doc.SourcePath)
            ? await _documents.GetDocument(userId, doc.SourcePath)
            : Result.Failure<Stream>(Error.FileNotPresent);
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
        var alreadyExists = _db.Documents.Any(d => d.FileName == file.FileName && d.OwnerId == userId);
        if (alreadyExists) return Result.Failure<DocumentDto>(Error.FileAlreadyExists);

        string path;
        try
        {
            path = await _documents.SaveDocument(userId, file);
        }
        catch (IOException e)
        {
            Console.WriteLine(e.ToString());
            return Result.Failure<DocumentDto>(Error.FileAlreadyExists);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return Result.Failure<DocumentDto>(new Error(e.ToString()));
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

        var newPath = await _documents.SoftDeleteDocument(userId, doc.SourcePath);
        doc.DeletedOnUtc = DateTime.UtcNow;
        doc.SourcePath = newPath;
        await _db.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> RestoreDocument(string userId, int id)
    {
        var doc = await _db.Documents.IgnoreQueryFilters().SingleOrDefaultAsync(d => d.Id == id && d.OwnerId == userId);
        if (doc is not { DeletedOnUtc: not null }) return Result.Failure(Error.FileNotFound);

        var isNotUnique = await _db.Documents.AnyAsync(d => d.FileName == doc.FileName);
        if (isNotUnique) return Result.Failure(Error.FileAlreadyExists);

        var newPath = await _documents.RestoreDocument(userId, doc.SourcePath);
        doc.DeletedOnUtc = null;
        doc.SourcePath = newPath;
        await _db.SaveChangesAsync();
        return Result.Success();
    }
}