using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Resources;

public record DownloadReq([Required] [MinLength(1)] int[] Ids);