using System.IO.Compression;
using inz.Server.Data;
using inz.Server.Dtos.Resources;
using inz.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.Services;

public interface IDocumentsService
{
    public Task<Result<DocumentStreamDto>> GetFileStream(string userId, int fileId);
    public Task<Result<DocumentStreamDto>> GetFileArchive(string userId, int[] fileIds);
    public Task<List<DocumentDto>> GetFiles(string userId);
    public Task<Result<DocumentDto>> SaveDocument(string userId, IFormFile file, string fileName);
    public Task<Result> EditDocument(string userId, int id, string newName);
    public Task<Result> DeleteDocument(string userId, int id);
    public Task<Result> DeleteDocuments(string userId, int[] fileIds);
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

    public async Task<Result<DocumentStreamDto>> GetFileStream(string userId, int fileId)
    {
        var doc = await _db.Documents.SingleOrDefaultAsync(d => d.Id == fileId && d.OwnerId == userId);
        if (doc == null) return Result.Failure<DocumentStreamDto>(Error.FileNotFound);
        if (!await _documents.DocumentExists(userId, doc.SourcePath))
            return Result.Failure<DocumentStreamDto>(Error.FileNotPresent);
        var stream = await _documents.GetDocument(userId, doc.SourcePath);
        return new DocumentStreamDto(stream, doc.FileName);
    }

    public async Task<Result<DocumentStreamDto>> GetFileArchive(string userId, int[] fileIds)
    {
        var docs = _db.Documents.Where(d => d.OwnerId == userId && fileIds.Contains(d.Id));
        if (await docs.CountAsync() != fileIds.Length) return Result.Failure<DocumentStreamDto>(Error.FileNotFound);
        var streams = await docs.SelectAsync(async d => (d, await _documents.GetDocument(userId, d.SourcePath)));

        var zipStream = new MemoryStream();
        using (var zip = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
        {
            foreach (var (doc, stream) in streams)
            {
                var zipEntry = zip.CreateEntry(doc.FileName, CompressionLevel.Fastest);
                await using var zipEntryStreaam = zipEntry.Open();
                await stream.CopyToAsync(zipEntryStreaam);
            }
        }

        zipStream.Seek(0, SeekOrigin.Begin);
        return new DocumentStreamDto(zipStream, "pliki_" + DateTime.Now + ".zip");
    }

    public async Task<List<DocumentDto>> GetFiles(string userId)
    {
        return await _db.Documents.Where(d => d.OwnerId == userId)
            .Select(doc => DocumentDto.Create(doc.Id, doc.FileName, doc.FileType))
            .ToListAsync();
    }

    public async Task<Result<DocumentDto>> SaveDocument(string userId, IFormFile file, string fileName)
    {
        var ex = Path.GetExtension(file.FileName);
        var fileType = FileExtensionToType(ex);
        if (fileType == null) return Result.Failure<DocumentDto>(Error.FileIllegalExtension);
        if (!fileName.EndsWith(ex)) fileName += ex;

        var alreadyExists = _db.Documents.Any(d => d.FileName == fileName && d.OwnerId == userId);
        if (alreadyExists) return Result.Failure<DocumentDto>(Error.FileAlreadyExists);

        string path;
        try
        {
            path = await _documents.SaveDocument(userId, file, fileName);
        }
        catch (IOException e)
        {
            Console.WriteLine(e.ToString());
            return Result.Failure<DocumentDto>(Error.FileAlreadyExists);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return Result.Failure<DocumentDto>(new Error("File.ERROR", e.ToString(), 500));
        }

        var user = await _db.Users.SingleAsync(u => u.Id == userId);
        var doc = new Document
        {
            User = user,
            FileName = fileName,
            FileType = (FileType)fileType,
            SourcePath = path,
            AddedOnUtc = DateTime.UtcNow,
            LastEditUtc = DateTime.UtcNow
        };
        await _db.Documents.AddAsync(doc);
        await _db.SaveChangesAsync();

        return DocumentDto.Create(doc.Id, fileName, doc.FileType);
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

    public async Task<Result> DeleteDocuments(string userId, int[] fileIds)
    {
        var docs = _db.Documents.Where(d => d.OwnerId == userId && fileIds.Contains(d.Id));
        if (await docs.CountAsync() != fileIds.Length) return Result.Failure<DocumentStreamDto>(Error.FileNotFound);

        foreach (var doc in docs)
        {
            var newPath = await _documents.SoftDeleteDocument(userId, doc.SourcePath);
            doc.DeletedOnUtc = DateTime.UtcNow;
            doc.SourcePath = newPath;
        }

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

    private static FileType? FileExtensionToType(string ex) => ex switch
    {
        ".doc" => FileType.Doc,
        ".docx" => FileType.Docx,
        ".pdf" => FileType.Pdf,
        ".txt" => FileType.Txt,
        _ => null
    };
}

public static class TaskExtensions
{
    public static async Task<IEnumerable<TResult>> SelectAsync<TSource, TResult>(
        this IEnumerable<TSource> source, Func<TSource, Task<TResult>> method)
    {
        return await Task.WhenAll(source.Select(method));
    }
}