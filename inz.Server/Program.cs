using System.Text;
using inz.Server;
using inz.Server.Controllers;
using inz.Server.Data;
using inz.Server.Models;
using inz.Server.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// db
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Db")));

// identity
builder.Services.AddIdentityCore<User>()
    .AddUserManager<UserManager<User>>()
    .AddEntityFrameworkStores<AppDbContext>();

// JWT Token
builder.Services.AddSingleton<ITokenProvider, TokenProvider>();
builder.Services.AddAuthorization();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
    {
        options.LoginPath = "/Account/Login";
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    })
    .AddJwtBearer(o =>
    {
        o.MapInboundClaims = false;
        o.RequireHttpsMetadata = false;
        o.TokenValidationParameters = new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!)),
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDocumentsService, DocumentsService>();
builder.Services.AddScoped<IDocumentsRepository, LocalDocumentsRepository>();
builder.Services.AddScoped<IPatientsService, PatientsService>();
builder.Services.AddScoped<IBookingsService, BookingService>();

builder.Services.AddHttpContextAccessor();

builder.Services.AddControllersWithViews();

// bg jobs
builder.Services.AddHostedService<TokenCleanupService>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

// endpoits
app.MapTestEndpoints();

app.MapFallbackToFile("/index.html");
    
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Account}/{action=Login}");

app.Run();

// ReSharper disable once ClassNeverInstantiated.Global
namespace inz.Server
{
    public partial class Program;
}