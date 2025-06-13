using inz.Server.Dtos.Patients;
using inz.Server.Dtos.Resources;
using Moq;

namespace inz.ServerTest.Factories;

public static class DtoFactory
{
    public static DocumentDto DocumentDto => new(0, "test", "test");
    public static DocumentStreamDto DocumentStreamDto => new(new Mock<Stream>().Object, "test");

    public static PatientDto PatientDto => new(0, "test", "test", new DateTime(1998, 11, 16));

    public static PatientDetailDto PatientDetailDto => new(0, "test", "test", new DateTime(1998, 11, 16), "test",
        "test", "test", "test", "test", "test", "test", "test", null, null);

    public static PatientContactDto PatientContactDto => new("test", "test", "test");

    public static EditPatientDto EditPatientDto => new(0, "test", "test", new DateTime(1998, 11, 16), "test", "test",
        "test", "test", "test", "test", null, null);
}