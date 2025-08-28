using inz.Server.Services;
using inz.Server.ViewModels.Patients;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace inz.Server.Controllers.MvcControllers;

[Authorize(Roles = "Admin", AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)] // todo: role 
[Route("Admin/Patients")]
public class PatientsAdminController : Controller
{
    private readonly IPatientsService _patients;

    public PatientsAdminController([FromServices] IPatientsService patientsService)
    {
        _patients = patientsService;
    }

    [HttpGet("")]
    public async Task<IActionResult> Index(string? search, int? page, string? selectedUserId)
    {
        const int pageSize = 20;
        var currentPage = page ?? 1;
        currentPage = currentPage < 1 ? 1 : currentPage;

        var patientList = await _patients.AdminGetPatients(search, selectedUserId, currentPage, pageSize);
        var model = new PatientIndexViewModel(patientList, search, selectedUserId, currentPage);
        return View(model);
    }

    [HttpGet("OfUser/{id}")]
    public async Task<IActionResult> GetPatientsForUser(string id)
    {
        var patients = await _patients.GetPatients(id);
        return Json(patients);
    }

    [HttpGet("Details/{id:int}")]
    public async Task<IActionResult> Details(int id)
    {
        var res = await _patients.AdminGetPatientDetails(id);
        if (res.IsFailure) return NotFound();

        var patientDetail = res.Value;
        var model = new PatientDetailsViewModel(patientDetail);
        return View(model);
    }

    [HttpGet("Edit/{id:int}")]
    public async Task<IActionResult> Edit(int id, string? returnUrl = null)
    {
        var res = await _patients.AdminGetPatientDetails(id);
        if (res.IsFailure) return NotFound();

        var patient = res.Value;
        var model = new PatientEditViewModel
        {
            Id = patient.Id,
            Name = patient.Name,
            Surname = patient.Surname,
            Dob = patient.Dob,
            Email = patient.Email,
            Phone = patient.Phone,
            Street = patient.Street,
            House = patient.House,
            Apartment = patient.Apartment,
            ZipCode = patient.ZipCode,
            Province = patient.Province,
            ProvinceList = GetProvincesSelectList(),
            City = patient.City,
            ReturnUrl = returnUrl
        };

        return View(model);
    }

    [HttpPost("Edit/{id:int}")]
    public async Task<IActionResult> Edit(int id, PatientEditViewModel model)
    {
        if (id != model.Id) return BadRequest();
        if (ModelState.IsValid)
        {
            var res = await _patients.AdminEditPatient(id, model);
            if (res.IsSuccess)
            {
                TempData["SuccessMessage"] = $"Pomyślnie zedytowano pacjenta {model.Name} {model.Surname}";
                return RedirectToAction("Index");
            }

            switch (res.Error)
            {
                case AppErrors.PatientAlreadyExists e:
                    ModelState.AddModelError(nameof(model.Name), e.Message);
                    ModelState.AddModelError(nameof(model.Surname), e.Message);
                    ModelState.AddModelError(nameof(model.Dob), e.Message);
                    break;
            }
        }

        model.ProvinceList = GetProvincesSelectList(model.Province);
        return View(model);
    }

    [HttpGet("Delete/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var res = await _patients.AdminGetPatient(id);
        if (res.IsFailure) return BadRequest();

        var patient = res.Value;
        var model = new PatientDeleteViewModel
        {
            Id = patient.Id,
            FullName = $"{patient.Name} {patient.Surname}"
        };
        return PartialView("_Delete", model);
    }

    [HttpPost("Delete/{id:int}")]
    public async Task<IActionResult> Delete(int id, PatientDeleteViewModel model)
    {
        if (model.Id != id) return BadRequest();
        await _patients.AdminDeletePatient(id);
        TempData["SuccessMessage"] = $"Pomyślnie usunięto pacjenta {model.FullName}";
        return RedirectToAction("Index");
    }

    private static SelectList GetProvincesSelectList(string? selectedProvince = null)
    {
        var provinces = new List<string>
        {
            "Dolnośląskie",
            "Kujawsko-pomorskie",
            "Lubelskie",
            "Lubuskie",
            "Łódzkie",
            "Małopolskie",
            "Mazowieckie",
            "Opolskie",
            "Podkarpackie",
            "Podlaskie",
            "Pomorskie",
            "Śląskie",
            "Świętokrzyskie",
            "Warmińsko-mazurskie",
            "Wielkopolskie",
            "Zachodniopomorskie"
        };
        return new SelectList(provinces, selectedProvince);
    }
}