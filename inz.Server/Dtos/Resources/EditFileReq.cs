using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Resources;

public class EditFileReq
{
    [Required]
    public string FileName { get; set; } = null!;
}