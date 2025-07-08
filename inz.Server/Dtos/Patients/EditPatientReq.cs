using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Patients;

public record EditPatientReq(
    [Required] [Length(1, 64)] string Name,
    [Required] [Length(1, 64)] string Surname,
    [Required] DateOnly Dob,
    [Required] [Length(1, 64)] string Street,
    [Required] [Length(1, 64)] string House,
    string? Apartment,
    [Required] [Length(1, 64)] string ZipCode,
    [Required] [Length(1, 64)] string Province,
    [Required] [Length(1, 64)] string City,
    [EmptyOrEmailAddress] [MaxLength(64)] string? Email,
    [MaxLength(64)] string? Phone
);