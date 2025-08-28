using inz.Server.Dtos.Mvc;

namespace inz.Server.ViewModels.Users;

public class IndexViewModel
{
    public List<UserDto> Users { get; set; } = [];
    public string? Search { get; set; }
    public int Page { get; set; }
    public int TotalPages { get; set; }
}