namespace inz.Server.Dtos.Mvc;

public record DocumentsListDto(
    List<DocumentViewDto> Documents,
    List<PatientSelectDto> Patients,
    List<UserDto> Users,
    int TotalPages
);