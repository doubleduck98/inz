namespace inz.Server.Dtos.Mvc;

public record PatientViewDto(
    int Id,
    string Name,
    string Surname,
    DateOnly Dob,
    string CoordinatingUserName
);