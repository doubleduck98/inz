namespace inz.Server.Dtos.Mvc;

public record PatientsListDto(
    List<PatientViewDto> Patients,
    List<UserDto> UserList,
    int TotalPages
);