using inz.Server.Dtos.Auth;
using inz.Server.Dtos.Bookings;
using inz.Server.Dtos.Patients;
using inz.Server.Dtos.Resources;
using Microsoft.AspNetCore.Http;
using Moq;

namespace inz.ServerTest.Factories;

public static class ReqFactory
{
    public static LoginReq LoginReq => new("test", "test");
    public static CreateFileReq CreateFileReq => new(new Mock<IFormFile>().Object, "test", 0);
    public static EditFileReq EditFileReq => new("test", 0);

    public static CreatePatientReq CreatePatientReq => new("test", "test", DateOnly.MinValue, "test", "test",
        "test", "test", "test", "test", false, null, null);

    public static AddContactReq AddContactReq => new("test", "test", "test");

    public static EditPatientReq EditPatientReq => new("test", "test", DateOnly.MinValue, "test", "test",
        "test", "test", "test", "test", null, null);

    public static CreateBookingReq CreateBookingReq =>
        new(0, 0, new Dictionary<DateOnly, int> { [DateOnly.MinValue] = 8 });

    public static EditBookingReq EditBookingReq => new EditBookingReq(0, 0);
    public static FreeReq FreeBookingReq => new(0, [DateOnly.MinValue]);
}