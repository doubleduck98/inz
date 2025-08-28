using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using inz.Server;
using inz.Server.Controllers;
using inz.Server.Controllers.ApiControllers;
using inz.Server.Dtos.Patients;
using inz.Server.Services;
using inz.ServerTest.Factories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace inz.ServerTest;

public class PatientsControllerTest
{
    private readonly PatientsController _controller;
    private readonly Mock<IPatientsService> _patientsService = new();

    public PatientsControllerTest()
    {
        _controller = new PatientsController(_patientsService.Object)
        {
            ControllerContext =
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity([
                        new Claim(JwtRegisteredClaimNames.Sub, ""),
                        new Claim("UserId", "")
                    ], "Test"))
                }
            }
        };
    }

    [Fact]
    public async Task Get_ShouldReturnPatientList()
    {
        _patientsService.Setup(p => p.GetPatients(It.IsAny<string>())).ReturnsAsync([]);

        var res = await _controller.Get(null);
        var oRes = res as ObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.Equal(StatusCodes.Status200OK, oRes!.StatusCode);
    }

    [Fact]
    public async Task GetWithSearch_ShouldReturnPatientList()
    {
        _patientsService.Setup(p => p.SearchPatients(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync([]);

        var res = await _controller.Get("test");
        
        var oRes = res as ObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.Equal(StatusCodes.Status200OK, oRes!.StatusCode);
    }

    [Fact]
    public async Task Get_PatientNotFoundShouldReturn404()
    {
        _patientsService.Setup(p => p.GetPatientDetails(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(Result.Failure<PatientDetailDto>(Error.PatientNotFound));

        var res = await _controller.Get(It.IsAny<int>());
        
        var nfRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status404NotFound, nfRes!.StatusCode);
    }

    [Fact]
    public async Task Get_PatientShouldReturn200()
    {
        _patientsService.Setup(p => p.GetPatientDetails(It.IsAny<string>(), It.IsAny<int>()))
            .ReturnsAsync(DtoFactory.PatientDetailDto);

        var res = await _controller.Get(It.IsAny<int>());
        
        var okRes = res as ObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.Equal(StatusCodes.Status200OK, okRes!.StatusCode);
    }

    [Fact]
    public async Task Create_ShouldReturn201()
    {
        _patientsService.Setup(p => p.CreatePatient(It.IsAny<string>(), It.IsAny<CreatePatientReq>()))
            .ReturnsAsync(DtoFactory.PatientDto);

        var req = ReqFactory.CreatePatientReq;
        var res = await _controller.Create(req);

        var createdRes = res as CreatedResult;
        Assert.IsType<CreatedResult>(res);
        Assert.IsType<PatientDto>(createdRes!.Value);
        Assert.Equal(StatusCodes.Status201Created, createdRes.StatusCode);
    }

    [Fact]
    public async Task Create_DuplicateShouldReturn409()
    {
        _patientsService.Setup(p => p.CreatePatient(It.IsAny<string>(), It.IsAny<CreatePatientReq>()))
            .ReturnsAsync(Result.Failure<PatientDto>(Error.PatientAlreadyExists));

        var req = ReqFactory.CreatePatientReq;
        var res = await _controller.Create(req);
        var confRes = res as ObjectResult;

        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status409Conflict, confRes!.StatusCode);
    }

    [Fact]
    public async Task Edit_ShouldReturn200()
    {
        _patientsService.Setup(p => p.EditPatient(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<EditPatientReq>()))
            .ReturnsAsync(DtoFactory.EditPatientDto);

        var req = ReqFactory.EditPatientReq;
        var res = await _controller.Edit(req, It.IsAny<int>());

        var okRes = res as OkObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.IsType<EditPatientDto>(okRes!.Value);
    }

    [Fact]
    public async Task Edit_DuplicateShouldReturn409()
    {
        _patientsService.Setup(p => p.EditPatient(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<EditPatientReq>()))
            .ReturnsAsync(Result.Failure<EditPatientDto>(Error.PatientAlreadyExists));

        var req = ReqFactory.EditPatientReq;
        var res = await _controller.Edit(req, It.IsAny<int>());

        var confRes = res as ObjectResult;
        Assert.IsType<ObjectResult>(res);
        Assert.Equal(StatusCodes.Status409Conflict, confRes!.StatusCode);
    }

    [Fact]
    public async Task AddContact_ShouldReturn200()
    {
        _patientsService.Setup(p => p.AddContact(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<AddContactReq>()))
            .ReturnsAsync(DtoFactory.PatientContactDto);

        var req = ReqFactory.AddContactReq;
        var res = await _controller.AddContact(It.IsAny<int>(), req);

        var okRes = res as OkObjectResult;
        Assert.IsType<OkObjectResult>(res);
        Assert.IsType<PatientContactDto>(okRes!.Value);
    }
}