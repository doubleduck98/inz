using System.ComponentModel.DataAnnotations;
using inz.Server.Dtos.Patients;

namespace inz.Server.ViewModels.Patients;

public class PatientDetailsViewModel
{
    public int Id { get; set; }

    [Display(Name = "Imię i nazwisko")]
    public string FullName { get; set; }

    [Display(Name = "Data urodzenia")]
    public DateOnly Dob { get; set; }

    [Display(Name = "Adres Email")]
    public string? Email { get; set; }

    [Display(Name = "Telefon")]
    public string? Phone { get; set; }

    [Display(Name = "Adres")]
    public string FullAddress { get; set; }

    public List<PatientContactDto> Contacts { get; set; }
    public List<string> Documents { get; set; }

    public PatientDetailsViewModel(PatientDetailDto dto)
    {
        Id = dto.Id;
        FullName = $"{dto.Name} {dto.Surname}";
        Dob = dto.Dob;
        Email = dto.Email;
        Phone = dto.Phone;
        FullAddress = $"{dto.Street} {dto.House}" +
                      (!string.IsNullOrEmpty(dto.Apartment) ? $"/{dto.Apartment}" : "") +
                      $", {dto.ZipCode} {dto.City}";
        Contacts = dto.Contacts ?? [];
        Documents = dto.Docs ?? [];
    }
}