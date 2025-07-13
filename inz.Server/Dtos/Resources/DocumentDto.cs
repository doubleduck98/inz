namespace inz.Server.Dtos.Resources;

public record DocumentDto(int Id, string FileName, int? PatientId, string? PatientName);