using inz.Server.Models;

namespace inz.Server.Dtos.Patients;

public record PatientDetailDto(
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
    string? Phone,
    List<PatientContactDto>? Contacts
)
{
    public PatientDetailDto(Patient p, List<PatientContactDto> contacts) : this(
        p.Id, p.Name, p.Surname, p.Dob, p.Street, p.House, p.Apartment, p.ZipCode,
        p.Province, p.City, p.Email, p.Phone, contacts.Count > 0 ? contacts : null)
    {
    }
};

public record PatientContactDto(string Name, string? Email, string? Phone);