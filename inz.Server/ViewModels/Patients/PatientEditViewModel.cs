using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace inz.Server.ViewModels.Patients;

public class PatientEditViewModel
{
    public int Id { get; set; }
    public string? ReturnUrl { get; set; }

    [Required(ErrorMessage = "Proszę podać imię")]
    [Display(Name = "Imię")]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać imię")]
    [Display(Name = "Nazwisko")]
    public string Surname { get; set; } = null!;

    [Required(ErrorMessage = "Proszę podać datę urodzenia")]
    [Display(Name = "Data urodzenia")]
    [DataType(DataType.Date)]
    public DateOnly Dob { get; set; }
        
    [EmailAddress]
    [Display(Name = "Adres Email (opcjonalnie)")]
    public string? Email { get; set; }

    [Phone]
    [Display(Name = "Telefon (opcjonalnie)")]
    public string? Phone { get; set; }

    [Required(ErrorMessage = "Proszę podać ulicę zamieszkania")]
    [Display(Name = "Ulica")]
    public string Street { get; set; } = null!;
        
    [Required(ErrorMessage = "Proszę podać numer domu")]
    [Display(Name = "Numer domu")]
    public string House { get; set; } = null!;
        
    [Display(Name = "Numer mieszkania")]
    public string? Apartment { get; set; }
        
    [Required(ErrorMessage = "Proszę podać kod pocztowy")]
    [Display(Name = "Kod pocztowy")]
    public string ZipCode { get; set; } = null!;
    
    [Required(ErrorMessage = "Proszę podać województwo")]
    [Display(Name = "Województwo")]
    public string Province { get; set; } = null!;
    
    public SelectList? ProvinceList { get; set; }
        
    [Required(ErrorMessage = "Proszę podać miasto")]
    [Display(Name = "Miasto")]
    public string City { get; set; } = null!;
}