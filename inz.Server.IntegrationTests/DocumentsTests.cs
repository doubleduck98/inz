using System.Net;
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
        resp.EnsureSuccessStatusCode();
        var doc = JsonConvert.DeserializeObject<DocumentDto>(await resp.Content.ReadAsStringAsync());
        Assert.NotNull(doc);
        var dbDoc = DbContext.Documents.SingleOrDefault(d => d.Id == doc.Id);
        Assert.NotNull(dbDoc);
        Assert.Equal(doc.Id, dbDoc.Id);
        Assert.True(Directory.Exists(Path.Combine(TestDir, TestUserId)));
    }

    [Fact]
    public async Task Create_ShouldNotAddDuplicateDocument()
    {
        var formData = await FormFactory.GetFormDataWithFile();

        var resp1 = await Client.PostAsync("/Resources/Create", formData);
        resp1.EnsureSuccessStatusCode();
        var doc = JsonConvert.DeserializeObject<DocumentDto>(await resp1.Content.ReadAsStringAsync());
        Assert.NotNull(doc);
        var dbDoc = DbContext.Documents.SingleOrDefault(d => d.Id == doc.Id);
        Assert.NotNull(dbDoc);
        Assert.Equal(doc.Id, dbDoc.Id);
        Assert.True(Directory.Exists(Path.Combine(TestDir, TestUserId)));

        var resp2 = await Client.PostAsync("/Resources/Create", formData);
        Assert.Equal(HttpStatusCode.Conflict, resp2.StatusCode);
        var allDocs = await DbContext.Documents.ToListAsync();
        Assert.Single(allDocs);
        var doc2 = allDocs.Single();
        Assert.Equal(doc.Id, doc2.Id);
    }

    [Fact]
    public async Task Delete_ShouldRemoveDocumentAndFile()
    {
        var formData = await FormFactory.GetFormDataWithFile();

        var createResp = await Client.PostAsync("/Resources/Create", formData);
        createResp.EnsureSuccessStatusCode();
        var docToDelete = JsonConvert.DeserializeObject<DocumentDto>(await createResp.Content.ReadAsStringAsync());
        Assert.NotNull(docToDelete);

        var deleteResp = await Client.DeleteAsync($"Resources/Delete/{docToDelete.Id}");
        deleteResp.EnsureSuccessStatusCode();
        var dbDocAfterDelete = await DbContext.Documents.SingleOrDefaultAsync(d => d.Id == docToDelete.Id);
        Assert.Null(dbDocAfterDelete);
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

        var dbDocAfterCreate = await DbContext.Documents.SingleOrDefaultAsync(d => d.Id == doc.Id);
        Assert.NotNull(dbDocAfterCreate);
        Assert.Null(dbDocAfterCreate.DeletedOnUtc);


        var deleteResp = await Client.DeleteAsync($"/Resources/Delete/{doc.Id}");
        deleteResp.EnsureSuccessStatusCode();

        var dbDocAfterDelete = await DbContext.Documents
            .IgnoreQueryFilters().AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == doc.Id);
        Assert.NotNull(dbDocAfterDelete);
        Assert.NotNull(dbDocAfterDelete.DeletedOnUtc);


        var restoreResp = await Client.PostAsync($"/Resources/Restore/{doc.Id}", null);
        restoreResp.EnsureSuccessStatusCode();

        var dbDocAfterRestore = await DbContext.Documents.SingleOrDefaultAsync(d => d.Id == doc.Id);
        Assert.NotNull(dbDocAfterRestore);
        Assert.Null(dbDocAfterRestore.DeletedOnUtc);
    }

    [Fact]
    public async Task Restore_ShouldReturnNotFoundForNonExistentId()
    {
        var nid = new Random().Next();
        var restoreResp = await Client.PostAsync($"/Resources/Restore/{nid}", null);
        Assert.Equal(HttpStatusCode.NotFound, restoreResp.StatusCode);
    }
}