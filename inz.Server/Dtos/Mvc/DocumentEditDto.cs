namespace inz.Server.Dtos.Mvc;

public record DocumentEditDto(
    int Id,
    string FileName,
    int? PatientId,
    string OwnerId
);