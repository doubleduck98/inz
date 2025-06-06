using inz.Server.Models;

namespace inz.Server.Dtos.Patients;

public record EditPatientDto(
    int Id,
    string Name,
    string Surname,
    DateTime Dob,
    string Street,
    string House,
    string? Apartment,
    string ZipCode,
    string Province,
    string City,
    string? Email,
    string? Phone
)
{
    public EditPatientDto(Patient p) : this(
        p.Id, p.Name, p.Surname, p.Dob, p.Street, p.House, p.Apartment, p.ZipCode,
        p.Province, p.City, p.Email, p.Phone)
    {
    }
}