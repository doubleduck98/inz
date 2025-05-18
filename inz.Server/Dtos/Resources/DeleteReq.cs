using System.ComponentModel.DataAnnotations;

namespace inz.Server.Dtos.Resources;

public record DeleteReq([Required] int[] Ids);