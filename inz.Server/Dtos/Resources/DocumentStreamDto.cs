namespace inz.Server.Dtos.Resources;

public record DocumentStreamDto(
    Stream File,
    string FileName
);