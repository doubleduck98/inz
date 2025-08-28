using inz.Server.Dtos.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace inz.Server.ViewModels.Documents;

public class DocIndexViewModel
{
    public List<DocumentViewDto> Documents { get; set; }

    public string? Search { get; set; }
    public string? SelectedUserId { get; set; }
    public int? SelectedPatientId { get; set; }

    public SelectList? UserList { get; set; }
    public SelectList? PatientList { get; set; }

    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }

    public DocIndexViewModel(string? search, string? selectedUserId, int? selectedPatientId,
        List<UserDto> userList, List<PatientSelectDto> patientList, List<DocumentViewDto> documents, int page, int totalPages)
    {
        var users = userList.Select(u => new { u.Id, FullName = $"{u.Name} {u.Surname}" });

        Documents = documents;
        Search = search;
        SelectedPatientId = selectedPatientId;
        SelectedUserId = selectedUserId;
        UserList = new SelectList(users, "Id", "FullName", selectedUserId ?? string.Empty);
        PatientList = new SelectList(patientList, "Id", "FullName", selectedPatientId);
        CurrentPage = page;
        TotalPages = totalPages;
    }
}