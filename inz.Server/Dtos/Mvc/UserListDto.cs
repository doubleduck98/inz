namespace inz.Server.Dtos.Mvc;

public record UserListDto(List<UserDto> Users, int TotalPages);