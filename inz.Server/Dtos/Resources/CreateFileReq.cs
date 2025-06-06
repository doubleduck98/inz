using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Resources;

public record CreateFileReq(
    [Required] IFormFile File,
    [Required] [MaxLength(200)] string FileName,
    [Required] int PatientId
);