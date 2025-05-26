using inz.Server.Data;
using inz.Server.Dtos.Patients;
using inz.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace inz.Server.Services;

public interface IPatientsService
{
    public Task<List<PatientDto>> GetPatients(string userId);
    public Task<List<PatientDto>> SearchPatients(string userId, string search);
    public Task<Result<PatientDto>> CreatePatient(string userId, CreatePatientReq req);
    public Task<Result<PatientDetailDto>> GetPatientDetails(string userId, int id);
}

public class PatientsService : IPatientsService
{
    private readonly AppDbContext _db;

    public PatientsService(AppDbContext dbContext)
    {
        _db = dbContext;
    }

    public async Task<List<PatientDto>> GetPatients(string userId)
    {
        return await _db.Patients.Where(p => p.CoordinatingUserId == userId)
            .Select(p => new PatientDto(p.Id, p.Name, p.Surname, p.Dob)).ToListAsync();
    }

    public async Task<List<PatientDto>> SearchPatients(string userId, string search)
    {
        var patterns = search.Split(' ', '-').Select(s => $"{s}%");
        return await _db.Patients.Where(p =>
                p.CoordinatingUserId == userId &&
                patterns.All(oattern =>
                    EF.Functions.ILike(p.Name, oattern) ||
                    EF.Functions.ILike(p.Surname, oattern)))
            .Select(p => new PatientDto(p.Id, p.Name, p.Surname, p.Dob)).ToListAsync();
    }

    public async Task<Result<PatientDto>> CreatePatient(string userId, CreatePatientReq req)
    {
        var exists = await _db.Patients.AnyAsync(p =>
            p.CoordinatingUserId == userId && p.Name == req.Name && p.Surname == req.Surname && p.Dob == req.Dob);
        if (exists) return Result.Failure<PatientDto>(Error.PatientAlreadyExists);

        var user = await _db.Users.SingleAsync(u => u.Id == userId);
        var newPatient = new Patient
        {
            CoordinatingUser = user,
            Name = req.Name,
            Surname = req.Surname,
            Dob = req.Dob,
            Street = req.Street,
            House = req.House,
            Apartment = req.Apartment,
            ZipCode = req.ZipCode,
            Province = req.Province,
            City = req.City
        };
        if (req is { HasContacts: true, Contacts: not null })
        {
            var contacts = req.Contacts!.Select(c => new PatientContact
                { Name = c.ContactName, Email = c.Email, Phone = c.Phone, Patient = newPatient });
            newPatient.Contacts = [];
            newPatient.Contacts.AddRange(contacts);
        }
        else if (req.PatientContact is not null)
        {
            newPatient.Email = req.PatientContact!.Email;
            newPatient.Phone = req.PatientContact.Phone;
        }

        await _db.Patients.AddAsync(newPatient);
        // await _db.SaveChangesAsync();
        return new PatientDto(newPatient.Id, newPatient.Name, newPatient.Surname, newPatient.Dob);
    }

    public async Task<Result<PatientDetailDto>> GetPatientDetails(string userId, int id)
    {
        var p = await _db.Patients.Include(p => p.Contacts)
            .SingleOrDefaultAsync(p => p.CoordinatingUserId == userId && p.Id == id);
        if (p == null) return Result.Failure<PatientDetailDto>(Error.PatientNotFound);
        
        var contacts = p.Contacts.Select(c => new PatientContactDto(c.Name, c.Email, c.Phone)).ToList();
        return new PatientDetailDto(p, contacts);
    }
}