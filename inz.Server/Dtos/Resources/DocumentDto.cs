namespace inz.Server.Dtos.Resources;

public class DocumentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = null!;
    public string FileType { get; set; } = null!;
}