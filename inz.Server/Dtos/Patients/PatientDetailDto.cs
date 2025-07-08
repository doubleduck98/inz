using inz.Server.Models;

namespace inz.Server.Dtos.Patients;

public record PatientDetailDto(
    int Id,
    string Name,
    string Surname,
    DateOnly Dob,
    string Street,
    string House,
    string? Apartment,
    string ZipCode,
    string Province,
    string City,
    string? Email,
    string? Phone,
    List<PatientContactDto>? Contacts,
    List<string>? Docs
)
{
    public PatientDetailDto(Patient p, List<PatientContactDto> contacts, List<string> docs) : this(
        p.Id, p.Name, p.Surname, p.Dob, p.Street, p.House, p.Apartment, p.ZipCode,
        p.Province, p.City, p.Email, p.Phone, contacts.Count > 0 ? contacts : null, docs.Count > 0 ? docs : null)
    {
    }
}