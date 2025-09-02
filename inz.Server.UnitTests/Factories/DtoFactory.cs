using inz.Server.Dtos.Auth;
using inz.Server.Dtos.Bookings;
using inz.Server.Dtos.Patients;
using inz.Server.Dtos.Resources;
using Moq;

namespace inz.ServerTest.Factories;

public static class DtoFactory
{
    public static LoginResp LoginResp => new("test", "test", "test", "test", "test");
    public static RefreshResp RefreshResp => new("test", "test");
    public static DocumentDto DocumentDto => new(0, "test", 0, "test");
    public static DocumentStreamDto DocumentStreamDto => new(new Mock<Stream>().Object, "test");

    public static PatientDto PatientDto => new(0, "test", "test", DateOnly.MinValue);

    public static PatientDetailDto PatientDetailDto => new(0, "test", "test", DateOnly.MinValue, "test",
        "test", "test", "test", "test", "test", "test", "test", null, null);

    public static PatientContactDto PatientContactDto => new("test", "test", "test");

    public static EditPatientDto EditPatientDto => new(0, "test", "test", DateOnly.MinValue, "test", "test",
        "test", "test", "test", "test", null, null);

    public static BookingDto BookingDto => new(0, 0, DateOnly.MinValue, 0, "test", 0, "test");
}