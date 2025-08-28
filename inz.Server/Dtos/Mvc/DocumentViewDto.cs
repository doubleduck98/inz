namespace inz.Server.Dtos.Mvc;

public record DocumentViewDto(
    int Id,
    string FileName,
    string Owner,
    string Patient,
    DateTime LastEditUtc
);