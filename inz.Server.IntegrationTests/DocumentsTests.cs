using System.Net;
using System.Net.Http.Json;
using inz.Server.Dtos.Resources;
using inz.Server.IntegrationTests.Infra;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace inz.Server.IntegrationTests;

public class DocumentsTests : BaseIntegrationTestClass
{
    public DocumentsTests(IntegrationTestWebAppFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Create_ShouldAddNewDocument()
    {
        var formData = await FormFactory.GetFormDataWithFile();

        var resp = await Client.PostAsync("/Resources/Create", formData);

        // make sure the response is successful
        resp.EnsureSuccessStatusCode();
        // response has data
        var doc = JsonConvert.DeserializeObject<DocumentDto>(await resp.Content.ReadAsStringAsync());
        Assert.NotNull(doc);
        // database has updated
        var dbDoc = DbContext.Documents.SingleOrDefault(d => d.Id == doc.Id);
        Assert.NotNull(dbDoc);
        // and document is properly stored
        Assert.True(File.Exists(Path.Combine(TestDir, TestUserId, dbDoc.SourcePath)));
    }

    [Fact]
    public async Task Create_ShouldNotAddDuplicateDocument()
    {
        var formData = await FormFactory.GetFormDataWithFile();

        var resp1 = await Client.PostAsync("/Resources/Create", formData);
        resp1.EnsureSuccessStatusCode();

        // assert that when the same file is submitted, no changes occur
        var docs = await DbContext.Documents.ToListAsync();
        var files = Directory.GetFiles(Path.Combine(TestDir, TestUserId));
        var resp2 = await Client.PostAsync("/Resources/Create", formData);
        Assert.Equal(HttpStatusCode.Conflict, resp2.StatusCode);
        var docs2 = await DbContext.Documents.ToListAsync();
        var files2 = Directory.GetFiles(Path.Combine(TestDir, TestUserId));
        Assert.Equal(docs, docs2);
        Assert.Equal(files, files2);
    }

    [Fact]
    public async Task Delete_ShouldRemoveDocumentAndFile()
    {
        var formData = await FormFactory.GetFormDataWithFile();

        var createResp = await Client.PostAsync("/Resources/Create", formData);
        createResp.EnsureSuccessStatusCode();
        var docToDelete = JsonConvert.DeserializeObject<DocumentDto>(await createResp.Content.ReadAsStringAsync());
        Assert.NotNull(docToDelete);
        var dbDoc = await DbContext.Documents.AsNoTracking() // do not track changes
            .SingleOrDefaultAsync(d => d.Id == docToDelete.Id);
        Assert.NotNull(dbDoc);

        // assert that after deleting a file, database record is altered
        var deleteResp = await Client.DeleteAsync($"Resources/Delete/{docToDelete.Id}");
        deleteResp.EnsureSuccessStatusCode();
        var dbDocAfterDelete = await DbContext.Documents.SingleOrDefaultAsync(d => d.Id == docToDelete.Id);
        Assert.Null(dbDocAfterDelete);
        // delete happened
        var deletedDoc = await DbContext.Documents
            .IgnoreQueryFilters().SingleOrDefaultAsync(d => d.Id == docToDelete.Id);
        Assert.NotNull(deletedDoc);
        // and file changed in storage
        Assert.True(File.Exists(Path.Combine(TestDir, TestUserId, deletedDoc.SourcePath)));
        Assert.NotEqual(dbDoc.SourcePath, deletedDoc.SourcePath);
    }

    [Fact]
    public async Task Delete_ShouldReturnNotFoundForNonExistentId()
    {
        var nid = new Random().Next();
        var deleteResp = await Client.DeleteAsync($"Resources/Delete/{nid}");
        Assert.Equal(HttpStatusCode.NotFound, deleteResp.StatusCode);
    }

    [Fact]
    public async Task Restore_ShouldRestoreDocument()
    {
        var formData = await FormFactory.GetFormDataWithFile();
        var createResp = await Client.PostAsync("/Resources/Create", formData);
        createResp.EnsureSuccessStatusCode();
        var doc = JsonConvert.DeserializeObject<DocumentDto>(await createResp.Content.ReadAsStringAsync());
        Assert.NotNull(doc);
        var dbDoc = await DbContext.Documents.AsNoTracking() // do not track changes
            .SingleOrDefaultAsync(d => d.Id == doc.Id);
        Assert.NotNull(dbDoc);
        Assert.Null(dbDoc.DeletedOnUtc);

        // assert that after successful delete-restore action
        var deleteResp = await Client.DeleteAsync($"/Resources/Delete/{doc.Id}");
        deleteResp.EnsureSuccessStatusCode();
        var restoreResp = await Client.PostAsync($"/Resources/Restore/{doc.Id}", null);
        restoreResp.EnsureSuccessStatusCode();
        // database record is back to its original state
        var dbDocAfterRestore = await DbContext.Documents.SingleOrDefaultAsync(d => d.Id == doc.Id);
        Assert.NotNull(dbDocAfterRestore);
        Assert.Null(dbDocAfterRestore.DeletedOnUtc);
        Assert.Equal(dbDoc.SourcePath, dbDocAfterRestore.SourcePath);
        // and so is the file in storage
        Assert.True(File.Exists(Path.Combine(TestDir, TestUserId, dbDoc.SourcePath)));
        Assert.True(File.Exists(Path.Combine(TestDir, TestUserId, dbDocAfterRestore.SourcePath)));
    }

    [Fact]
    public async Task Restore_ShouldReturnNotFoundForNonExistentId()
    {
        var nid = new Random().Next();
        var restoreResp = await Client.PostAsync($"/Resources/Restore/{nid}", null);
        Assert.Equal(HttpStatusCode.NotFound, restoreResp.StatusCode);
    }

    [Fact]
    public async Task Edit_ShouldEditDocumentAndFile()
    {
        var formData = await FormFactory.GetFormDataWithFile();
        var createResp = await Client.PostAsync("/Resources/Create", formData);
        createResp.EnsureSuccessStatusCode();
        var doc = JsonConvert.DeserializeObject<DocumentDto>(await createResp.Content.ReadAsStringAsync());
        Assert.NotNull(doc);
        var dbDoc = await DbContext.Documents.AsNoTracking() // do not track changes
            .SingleOrDefaultAsync(d => d.Id == doc.Id);
        Assert.NotNull(dbDoc);

        const string newFileName = "test.pdf"; // account for .pdf being added regardless
        var req = new EditFileReq(newFileName, TestPatientId);

        // assert that after successful edit
        var resp = await Client.PutAsJsonAsync($"/Resources/Edit/{doc.Id}", req);
        resp.EnsureSuccessStatusCode();
        // database record is appropriately changed
        var afterEditDbDoc = await DbContext.Documents.SingleOrDefaultAsync(d => d.Id == doc.Id);
        Assert.NotNull(afterEditDbDoc);
        Assert.Equal(newFileName, afterEditDbDoc.SourcePath);
        // and so is the file in storage
        Assert.True(File.Exists(Path.Combine(TestDir, TestUserId, newFileName)));
        Assert.False(File.Exists(Path.Combine(TestDir, TestUserId, dbDoc.SourcePath)));
    }
}