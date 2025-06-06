using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Patients;

public record AddContactReq(
    [Required] [Length(1, 64)] string Name,
    [EmptyOrEmailAddress] [MaxLength(64)] string? Email,
    [MaxLength(64)] string? Phone
);