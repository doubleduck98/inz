using inz.Server.Dtos.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace inz.Server.ViewModels.Patients;

public class PatientIndexViewModel
{
    public List<PatientViewDto> Patients { get; set; }
    public string? Search { get; set; }
    public string? SelectedUserId { get; set; }
    public SelectList UserList { get; set; }
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }

    public PatientIndexViewModel(PatientsListDto dto, string? search, string? selectedUser, int page)
    {
        var users = dto.UserList.Select(u => new { u.Id, FullName = $"{u.Name} {u.Surname}" }).ToList();

        Patients = dto.Patients;
        TotalPages = dto.TotalPages;
        UserList = new SelectList(users, "Id", "FullName", selectedUser ?? string.Empty);
        Search = search;
        CurrentPage = page;
    }
}