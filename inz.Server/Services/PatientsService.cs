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
    public Task<Result<EditPatientDto>> EditPatient(string userId, int id, EditPatientReq req);
    public Task<Result<PatientContactDto>> AddContact(string userId, int id, AddContactReq req);
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
            .OrderBy(p=>p.Surname)
            .Select(p => new PatientDto(p.Id, p.Name, p.Surname, p.Dob)).ToListAsync();
    }

    public async Task<List<PatientDto>> SearchPatients(string userId, string search)
    {
        var patterns = search.Split(' ', '-').Select(s => $"{s}%");
        return await _db.Patients.Where(p =>
                p.CoordinatingUserId == userId &&
                patterns.All(pattern =>
                    EF.Functions.ILike(p.Name, pattern) ||
                    EF.Functions.ILike(p.Surname, pattern)))
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
        await _db.SaveChangesAsync();
        return new PatientDto(newPatient.Id, newPatient.Name, newPatient.Surname, newPatient.Dob);
    }

    public async Task<Result<PatientDetailDto>> GetPatientDetails(string userId, int id)
    {
        var p = await _db.Patients
            .Include(p => p.Contacts)
            .Include(p => p.Documents)
            .SingleOrDefaultAsync(p => p.CoordinatingUserId == userId && p.Id == id);
        if (p == null) return Result.Failure<PatientDetailDto>(Error.PatientNotFound);

        var contacts = p.Contacts.Select(c => new PatientContactDto(c.Name, c.Email, c.Phone)).ToList();
        var docs = p.Documents.Select(d => d.FileName).ToList();
        return new PatientDetailDto(p, contacts, docs);
    }

    public async Task<Result<EditPatientDto>> EditPatient(string userId, int id, EditPatientReq req)
    {
        var exists = await _db.Patients.AnyAsync(p =>
            p.CoordinatingUserId == userId && p.Name == req.Name && p.Surname == req.Surname && p.Dob == req.Dob &&
            p.Id != id);
        if (exists) return Result.Failure<EditPatientDto>(Error.PatientAlreadyExists);

        var patient = await _db.Patients.SingleAsync(p => p.Id == id && p.CoordinatingUserId == userId);
        UpdatePatient(patient, req);
        _db.Patients.Update(patient);
        await _db.SaveChangesAsync();

        return new EditPatientDto(patient);
    }

    public async Task<Result<PatientContactDto>> AddContact(string userId, int id, AddContactReq req)
    {
        var patient = await _db.Patients.Include(p => p.Contacts)
            .SingleAsync(p => p.Id == id && p.CoordinatingUserId == userId);
        var contact = new PatientContact
        {
            Patient = patient,
            Name = req.Name,
            Email = req.Email,
            Phone = req.Phone
        };
        patient.Contacts.Add(contact);
        _db.Patients.Update(patient);
        await _db.SaveChangesAsync();
        return new PatientContactDto(contact.Name, contact.Email, contact.Phone);
    }

    private static void UpdatePatient(Patient p, EditPatientReq req)
    {
        p.Name = req.Name;
        p.Surname = req.Surname;
        p.Dob = req.Dob;
        p.Street = req.Street;
        p.House = req.House;
        p.Apartment = req.Apartment;
        p.ZipCode = req.ZipCode;
        p.Province = req.Province;
        p.City = req.City;
        p.Email = req.Email;
        p.Phone = req.Phone;
    }
}