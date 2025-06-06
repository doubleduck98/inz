using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Resources;

public record EditFileReq(
    [Required] [MaxLength(200)] string FileName,
    [Required] int PatientId
);