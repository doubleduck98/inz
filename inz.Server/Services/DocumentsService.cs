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
    public Task<List<DocumentDto>> GetDocuments(string userId);
    public Task<List<DeletedDocDto>> GetDeletedDocuments(string userId);
    public Task<Result<DocumentDto>> SaveDocument(string userId, CreateFileReq req);
    public Task<Result<DocumentDto>> EditDocument(string userId, int id, EditFileReq req);
    public Task<Result> DeleteDocument(string userId, int id);
    public Task<Result> DeleteDocuments(string userId, int[] fileIds);
    public Task<Result<DocumentDto>> RestoreDocument(string userId, int id);
    public Task<Result> PurgeDocument(string userId, int id);
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
        var streamsTasks = docs.AsEnumerable().Select(async d =>
        {
            var stream = await _documents.GetDocument(userId, d.SourcePath);
            return (d, stream);
        });
        var streams = await Task.WhenAll(streamsTasks);

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
        return new DocumentStreamDto(zipStream, "pliki " + DateTime.Now.ToString("g") + ".zip");
    }

    public async Task<List<DocumentDto>> GetDocuments(string userId)
    {
        return await _db.Documents.Include(d => d.Patient)
            .Where(d => d.OwnerId == userId)
            .OrderByDescending(d => d.LastEditUtc).ThenByDescending(d => d.AddedOnUtc)
            .Select(doc => new DocumentDto(doc.Id, doc.FileName, doc.PatientId,
                doc.Patient != null ? $"{doc.Patient.Name} {doc.Patient.Surname}" : null))
            .ToListAsync();
    }

    public async Task<List<DeletedDocDto>> GetDeletedDocuments(string userId)
    {
        return await _db.Documents.IgnoreQueryFilters()
            .Where(d => d.OwnerId == userId && d.DeletedOnUtc != null)
            .OrderByDescending(d => d.DeletedOnUtc)
            .Select(d => new DeletedDocDto(d.Id, d.FileName, d.DeletedOnUtc))
            .ToListAsync();
    }

    public async Task<Result<DocumentDto>> SaveDocument(string userId, CreateFileReq req)
    {
        var (file, fileName, patientId) = req;
        var ex = Path.GetExtension(file.FileName);
        var fileType = FileExtensionToType(ex);
        if (fileType == null) return Result.Failure<DocumentDto>(Error.FileIllegalExtension);
        if (!fileName.EndsWith(ex)) fileName += ex;

        var alreadyExists = _db.Documents.Any(d => d.FileName == fileName && d.OwnerId == userId);
        if (alreadyExists) return Result.Failure<DocumentDto>(Error.FileAlreadyExists);

        var userWithPatient = await _db.Users
            .Join(_db.Patients, u => u.Id, p => p.CoordinatingUserId, (user, patient) => new { user, patient })
            .SingleOrDefaultAsync(up => up.user.Id == userId && up.patient.Id == patientId);
        if (userWithPatient == null) return Result.Failure<DocumentDto>(Error.PatientNotFound);

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

        var doc = new Document
        {
            User = userWithPatient.user,
            Patient = userWithPatient.patient,
            FileName = fileName,
            FileType = (FileType)fileType,
            SourcePath = path,
            AddedOnUtc = DateTime.UtcNow,
            LastEditUtc = DateTime.UtcNow
        };
        await _db.Documents.AddAsync(doc);
        await _db.SaveChangesAsync();

        var pName = $"{userWithPatient.patient.Name} {userWithPatient.patient.Surname}";
        return new DocumentDto(doc.Id, fileName, doc.PatientId, pName);
    }

    public async Task<Result<DocumentDto>> EditDocument(string userId, int id, EditFileReq req)
    {
        var doc = await _db.Documents.Include(d => d.Patient)
            .SingleOrDefaultAsync(d => d.Id == id && d.OwnerId == userId);
        if (doc == null) return Result.Failure<DocumentDto>(Error.FileNotFound);

        var patient =
            await _db.Patients.SingleOrDefaultAsync(p => p.Id == req.PatientId && p.CoordinatingUserId == userId);
        if (patient == null) return Result.Failure<DocumentDto>(Error.PatientNotFound);

        var ex = Path.GetExtension(doc.FileName);
        var newFileName = req.FileName;
        if (!req.FileName.EndsWith(ex)) newFileName += ex;

        if (doc.FileName != newFileName)
        {
            var alreadyExists = _db.Documents.Any(d => d.FileName == newFileName && d.OwnerId == userId);
            if (alreadyExists) return Result.Failure<DocumentDto>(Error.FileAlreadyExists);

            try
            {
                if (req.FileName != doc.FileName)
                {
                    var newPath = await _documents.RenameDocument(userId, doc.SourcePath, newFileName);
                    doc.SourcePath = newPath;
                }
            }
            catch (IOException e)
            {
                Console.WriteLine(e.ToString());
                return Result.Failure<DocumentDto>(Error.FileAlreadyExists);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return Result.Failure<DocumentDto>(new Error("File.ERROR", e.Message, 500));
            }
        }

        doc.FileName = newFileName;
        doc.Patient = patient;
        doc.LastEditUtc = DateTime.UtcNow;
        _db.Documents.Update(doc);
        await _db.SaveChangesAsync();

        return new DocumentDto(doc.Id, doc.FileName, patient.Id, $"{patient.Name} {patient.Surname}");
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

    public async Task<Result<DocumentDto>> RestoreDocument(string userId, int id)
    {
        var doc = await _db.Documents.IgnoreQueryFilters()
            .Include(d => d.Patient)
            .SingleOrDefaultAsync(d => d.Id == id && d.OwnerId == userId);
        if (doc is not { DeletedOnUtc: not null }) return Result.Failure<DocumentDto>(Error.FileNotFound);

        // if we make an attempt to restore a file and another already has that name,
        // calculate new file name, appending serial numbers to the original name,
        // mimicking web browser behaviour, when downloading the same file multiple times
        var newFileName = doc.FileName;
        var counter = 1;
        while (await _db.Documents.AnyAsync(d => d.SourcePath == newFileName && d.OwnerId == userId))
        {
            var stripped = Path.GetFileNameWithoutExtension(doc.FileName);
            var ex = Path.GetExtension(doc.FileName);
            newFileName = $"{stripped} ({counter}){ex}";
            counter += 1;
        }

        var newPath = await _documents.RestoreDocument(userId, doc.SourcePath, newFileName);
        doc.DeletedOnUtc = null;
        doc.FileName = newFileName;
        doc.LastEditUtc = DateTime.UtcNow;
        doc.SourcePath = newPath;
        await _db.SaveChangesAsync();
        return Result.Success(new DocumentDto(doc.Id, doc.FileName, doc.PatientId,
            doc.Patient != null ? $"{doc.Patient.Name} {doc.Patient.Surname}" : null));
    }

    public async Task<Result> PurgeDocument(string userId, int id)
    {
        var doc = await _db.Documents.IgnoreQueryFilters()
            .SingleOrDefaultAsync(d => d.Id == id && d.OwnerId == userId && d.DeletedOnUtc != null);
        if (doc == null) return Result.Failure(Error.FileNotFound);

        try
        {
            await _documents.DeleteDocument(userId, doc.SourcePath);
        }
        catch (DirectoryNotFoundException e)
        {
            Console.WriteLine(e.ToString());
            return Result.Failure(Error.FileNotPresent);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.ToString());
            return Result.Failure<DocumentDto>(new Error("File.ERROR", e.Message, 500));
        }

        _db.Documents.Remove(doc);
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