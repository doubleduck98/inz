namespace inz.Server.IntegrationTests.Infra;

public static class FormFactory
{
    public static Task<MultipartFormDataContent> GetFormDataWithFile()
    {
        var fileStream = new FileStream(Path.Combine(Environment.CurrentDirectory, "TestDocuments/test.pdf"),
            FileMode.Open);
        var fileContent = new StreamContent(fileStream);
        var formData = new MultipartFormDataContent();
        // random filename is necessary for the test do avoid colissions ¯\_(ツ)_/¯
        var fileName = Guid.NewGuid().ToString();
        formData.Add(fileContent, "file", fileName + ".pdf");
        formData.Add(new StringContent(fileName), "fileName");
        return Task.FromResult(formData);
    }
}