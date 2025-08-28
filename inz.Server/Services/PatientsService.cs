using inz.Server.Data;
using inz.Server.Dtos.Mvc;
using inz.Server.Dtos.Patients;
using inz.Server.Models;
using inz.Server.ViewModels.Patients;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace inz.Server.Services;

public interface IPatientsService
{
    /// <summary>
    /// Returns a list of user's patients.
    /// </summary>
    public Task<List<PatientDto>> GetPatients(string userId);

    /// <summary>
    /// Returns a list of user's patients whose names or surnames start with searched value.
    /// </summary>
    public Task<List<PatientDto>> SearchPatients(string userId, string search);

    /// <summary>
    /// Creates a patient for a given user.
    /// </summary>
    public Task<Result<PatientDto>> CreatePatient(string userId, CreatePatientReq req);

    /// <summary>
    /// Returns patient info with full information.
    /// </summary>
    public Task<Result<PatientDetailDto>> GetPatientDetails(string userId, int id);

    /// <summary>
    /// Edits info of specified patient.
    /// </summary>
    public Task<Result<EditPatientDto>> EditPatient(string userId, int id, EditPatientReq req);

    /// <summary>
    /// Adds a contact to specified user.
    /// </summary>
    public Task<Result<PatientContactDto>> AddContact(string userId, int id, AddContactReq req);

    /// <summary>
    /// Admin method for getting specified user info.
    /// </summary>
    public Task<Result<PatientDto>> AdminGetPatient(int id);

    /// <summary>
    /// Admin method returning paginated list of users supporting search.
    /// </summary>
    public Task<PatientsListDto> AdminGetPatients(string? search, string? userId, int page, int pageSize);

    /// <summary>
    /// Admin method for returning a list of patients of specified user.
    /// </summary>
    public Task<List<PatientDto>> AdminGetPatientList(string userId);

    /// <summary>
    /// Admin method for getting specidied patient details.
    /// </summary>
    public Task<Result<PatientDetailDto>> AdminGetPatientDetails(int id);

    /// <summary>
    /// Admin method for editing patient.
    /// </summary>
    public Task<Result> AdminEditPatient(int id, PatientEditViewModel model);

    /// <summary>
    /// Admin method for deleting patient.
    /// </summary>
    public Task AdminDeletePatient(int id);
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
            .OrderBy(p => p.Surname)
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

    public async Task<Result<PatientDto>> AdminGetPatient(int id)
    {
        var patient = await _db.Patients.SingleOrDefaultAsync(p => p.Id == id);
        return patient == null
            ? Result.Failure<PatientDto>(Error.PatientNotFound)
            : new PatientDto(patient.Id, patient.Name, patient.Surname, patient.Dob);
    }

    public async Task<PatientsListDto> AdminGetPatients(string? search, string? userId, int page, int pageSize)
    {
        var patientsQuery = _db.Patients.Include(p => p.CoordinatingUser).AsQueryable();
        if (!search.IsNullOrEmpty())
        {
            patientsQuery = patientsQuery.Where(p =>
                EF.Functions.ILike(p.Name, $"{search!}%") ||
                EF.Functions.ILike(p.Surname, $"{search!}%"));
        }

        if (userId != null)
        {
            patientsQuery = patientsQuery.Where(p => p.CoordinatingUserId == userId);
        }

        var totalPatients = await patientsQuery.CountAsync();
        var totalPages = (int)Math.Ceiling(totalPatients / (double)pageSize);
        var patients = await patientsQuery.OrderBy(p => p.Surname).ThenBy(p => p.Name)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new PatientViewDto(p.Id, p.Name, p.Surname, p.Dob, p.CoordinatingUser!.FullName))
            .ToListAsync();
        var users = await _db.Users.Select(u => new UserDto(u.Id, u.Name, u.Surname, u.Email ?? "", u.PhoneNumber))
            .ToListAsync();
        return new PatientsListDto(patients, users, totalPages);
    }

    public async Task<List<PatientDto>> AdminGetPatientList(string userId)
    {
        return await _db.Patients.Where(p => p.CoordinatingUserId == userId)
            .Select(p => new PatientDto(p.Id, p.Name, p.Surname, p.Dob))
            .ToListAsync();
    }

    public async Task<Result<PatientDetailDto>> AdminGetPatientDetails(int id)
    {
        var patient = await _db.Patients.Include(p => p.CoordinatingUser)
            .Include(p => p.Documents).Include(p => p.Contacts)
            .SingleOrDefaultAsync(p => p.Id == id);

        if (patient == null) return Result.Failure<PatientDetailDto>(Error.PatientNotFound);

        var contacts = patient.Contacts.Select(c => new PatientContactDto(c.Name, c.Email, c.Phone)).ToList();
        var docs = patient.Documents.Select(d => d.FileName).ToList();
        return new PatientDetailDto(patient, contacts, docs);
    }

    public async Task<Result> AdminEditPatient(int id, PatientEditViewModel model)
    {
        var exists = await _db.Patients.AnyAsync(p =>
            p.Name == model.Name && p.Surname == model.Surname && p.Dob == model.Dob && p.Id != id);
        if (exists) return Result.Failure<EditPatientDto>(new AppErrors.PatientAlreadyExists());

        var patient = await _db.Patients.SingleAsync(p => p.Id == id);
        UpdatePatient(patient, model);
        _db.Patients.Update(patient);
        await _db.SaveChangesAsync();

        return Result.Success();
    }

    public async Task AdminDeletePatient(int id)
    {
        var patient = await _db.Patients.SingleAsync(p => p.Id == id);
        _db.Patients.Remove(patient);
        await _db.SaveChangesAsync();
    }

    private static void UpdatePatient(Patient p, PatientEditViewModel model)
    {
        p.Name = model.Name;
        p.Surname = model.Surname;
        p.Dob = model.Dob;
        p.Street = model.Street;
        p.House = model.House;
        p.Apartment = model.Apartment;
        p.ZipCode = model.ZipCode;
        p.Province = model.Province;
        p.City = model.City;
        p.Email = model.Email;
        p.Phone = model.Phone;
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