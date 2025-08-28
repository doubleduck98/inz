using System.ComponentModel.DataAnnotations;

namespace inz.Server.ViewModels.Rooms;

public class RoomCreateViewModel
{
    [Display(Name = "Nazwa sali")]
    [Required(ErrorMessage = "Proszę podać nazwę sali")]
    [StringLength(127, ErrorMessage = "Nazwa sali nie może być dłuższa niż 127 znaków")]
    public string Name { get; set; } = null!;
}