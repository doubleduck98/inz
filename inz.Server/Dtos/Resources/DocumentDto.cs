using inz.Server.Models;

namespace inz.Server.Dtos.Resources;

public class DocumentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = null!;
    public string FileType { get; set; } = null!;

    public static DocumentDto Create(int id, string fileName, FileType fileType) =>
        new() { Id = id, FileName = fileName, FileType = fileType.ToString() };
}