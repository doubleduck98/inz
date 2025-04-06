using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Resources;

public class GetFileReq
{
    [Required]
    public string FileName { get; set; } = null!;
}