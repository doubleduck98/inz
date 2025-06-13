using inz.Server.Dtos.Patients;
using inz.Server.Dtos.Resources;
using Microsoft.AspNetCore.Http;
using Moq;

namespace inz.ServerTest.Factories;

public static class ReqFactory
{
    public static CreateFileReq CreateFileReq => new(new Mock<IFormFile>().Object, "test", 0);
    public static EditFileReq EditFileReq => new("test", 0);

    public static CreatePatientReq CreatePatientReq => new("test", "test", new DateTime(1998, 11, 16), "test", "test",
        "test", "test", "test", "test", false, null, null);

    public static AddContactReq AddContactReq => new("test", "test", "test");

    public static EditPatientReq EditPatientReq => new("test", "test", new DateTime(1998, 11, 16), "test", "test",
        "test", "test", "test", "test", null, null);
}