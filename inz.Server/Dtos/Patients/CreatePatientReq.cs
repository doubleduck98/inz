using System.ComponentModel.DataAnnotations;
using Microsoft.IdentityModel.Tokens;

namespace inz.Server.Dtos.Patients;

public record CreatePatientReq(
    [Required] [Length(1, 64)] string Name,
    [Required] [Length(1, 64)] string Surname,
    [Required] DateTime Dob,
    [Required] [Length(1, 64)] string Street,
    [Required] [Length(1, 64)] string House,
    string? Apartment,
    [Required] [Length(1, 64)] string ZipCode,
    [Required] [Length(1, 64)] string Province,
    [Required] [Length(1, 64)] string City,
    bool HasContacts,
    PatientContactReq? PatientContact,
    List<ContactReq>? Contacts
);

public record PatientContactReq(
    [EmptyOrEmailAddress] [MaxLength(64)] string? Email,
    [MaxLength(64)] string? Phone
);

public record ContactReq(
    [Length(1, 64)] string ContactName,
    [EmptyOrEmailAddress] [MaxLength(64)] string? Email,
    [MaxLength(64)] string? Phone
);

public class EmptyOrEmailAddress : ValidationAttribute
{
    public EmptyOrEmailAddress() : base("The Email field is not empty and not a valid e-mail address")
    {
    }

    public override bool IsValid(object? value)
    {
        if (value == null || value.ToString().IsNullOrEmpty()) return true;
        try
        {
            var email = value.ToString();
            var emailAttr = new EmailAddressAttribute();
            return emailAttr.IsValid(email);
        }
        catch
        {
            return false;
        }
    }
}