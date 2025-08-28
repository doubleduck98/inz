using System.ComponentModel.DataAnnotations;
using inz.Server.Dtos.Patients;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace inz.Server.ViewModels.Documents;

public class DocEditViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Proszę podaać nazwę pliku")]
    [Display(Name = "Nazwa pliku")]
    public string FileName { get; set; } = null!;

    [Required(ErrorMessage = "Proszę wybrać pacjenta")]
    [Display(Name = "Pacjent")]
    public int? PatientId { get; set; }

    public string OwnerId { get; set; } = null!;
    public SelectList? PatientList { get; set; }

    public DocEditViewModel()
    {
    }

    public DocEditViewModel(int id, string fileName, int? patientId, string ownerId, List<PatientDto> patientList)
    {
        Id = id;
        FileName = fileName;
        PatientId = patientId;
        OwnerId = ownerId;
        AddPatientList(patientList);
    }

    public void AddPatientList(List<PatientDto> patientList, int? patientId = null)
    {
        var patients = patientList.Select(p => new { p.Id, FullName = $"{p.Name} {p.Surname}" });
        PatientList = new SelectList(patients, "Id", "FullName", patientId);
    }
}