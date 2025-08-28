using inz.Server.Services;
using inz.Server.ViewModels.Documents;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inz.Server.Controllers.MvcControllers;

[Route("Admin/Documents")]
[Authorize(Roles = "Admin", AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class DocumentsAdminController : Controller
{
    private readonly IDocumentsService _documents;
    private readonly IPatientsService _patients;

    public DocumentsAdminController([FromServices] IDocumentsService documentsService,
        [FromServices] IPatientsService patientsService)
    {
        _documents = documentsService;
        _patients = patientsService;
    }

    [HttpGet("")]
    public async Task<IActionResult> Index(string? search, string? selectedUserId, int? selectedPatientId, int? page)
    {
        const int pageSize = 20;
        var currentPage = page ?? 1;
        currentPage = currentPage < 1 ? 1 : currentPage;

        var documentsList =
            await _documents.AdminGetDocuments(search, selectedUserId, selectedPatientId, currentPage, pageSize);
        var model = new DocIndexViewModel(search, selectedUserId, selectedPatientId, documentsList.Users,
            documentsList.Patients, documentsList.Documents, currentPage, documentsList.TotalPages);
        return View(model);
    }

    [HttpGet("Edit/{id:int}")]
    public async Task<IActionResult> Edit(int id)
    {
        var res = await _documents.AdminGetDocumentEdit(id);
        if (res.IsFailure) return NotFound(res.Error!.Message);

        var dto = res.Value;
        var patientList = await _patients.AdminGetPatientList(dto.OwnerId);
        var model = new DocEditViewModel(dto.Id, dto.FileName, dto.PatientId, dto.OwnerId, patientList);
        return View(model);
    }

    [HttpPost("Edit/{id:int}")]
    public async Task<IActionResult> Edit(int id, DocEditViewModel model)
    {
        if (ModelState.IsValid)
        {
            var res = await _documents.AdminEditDocument(id, model);
            if (res.IsSuccess)
            {
                TempData["SuccessMessage"] = $"Pomyślnie zedytowano plik {model.FileName}";
                return RedirectToAction("Index");
            }

            switch (res.Error)
            {
                case AppErrors.FileNotFound e:
                    ModelState.AddModelError(nameof(model.FileName), e.Message);
                    break;
                case AppErrors.FileAlreadyExists e:
                    ModelState.AddModelError(nameof(model.FileName), e.Message);
                    break;
                case AppErrors.PatientNotFound e:
                    ModelState.AddModelError(nameof(model.PatientId), e.Message);
                    break;
            }
        }

        var patients = await _patients.AdminGetPatientList(model.OwnerId);
        model.AddPatientList(patients);
        return View(model);
    }

    [HttpGet("Delete/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var res = await _documents.AdminGetDocument(id);
        if (res.IsFailure) return NotFound(res.Error!.Message);

        var doc = res.Value;
        var model = new DocDeleteViewModel { Id = doc.Id, FileName = doc.FileName };
        return PartialView("_Delete", model);
    }

    [HttpPost("Delete/{id:int}")]
    public async Task<IActionResult> Delete(int id, DocDeleteViewModel model)
    {
        var res = await _documents.AdminDeleteDocument(id);
        if (res.IsSuccess)
        {
            TempData["SuccessMessage"] = $"Pomyślnie usunięto dokument {model.FileName}";
        }
        else
        {
            TempData["ErrorMessage"] = res.Error!.Message;
        }

        return RedirectToAction("Index");
    }

    [HttpGet("Download/{id:int}")]
    public async Task<IActionResult> Downloadn(int id)
    {
        var res = await _documents.AdminGetFileStream(id);
        if (res.IsFailure) return NotFound(res.Error!.Message);

        var stream = res.Value;
        return File(stream.File, "application/octet-stream", stream.FileName);
    }
}