using Microsoft.EntityFrameworkCore;
using UITour.Models;
using UITour.DAL;
using UITour.DAL.Interfaces;
using UITour.DAL.Interfaces.Repositories;
using UITour.DAL.Repositories;
using UITour.ServicesL.Implementations;
using UITour.ServicesL.Interfaces;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
var connectionString = builder.Configuration.GetConnectionString("MyDB");

// Đăng ký DbContext với DI
builder.Services.AddDbContext<UITourContext>(options =>
    options.UseSqlServer(connectionString));

// DAL registrations
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ICountryRepository, CountryRepository>();
builder.Services.AddScoped<ICityRepository, CityRepository>();
builder.Services.AddScoped<INeighbourhoodRepository, NeighbourhoodRepository>();
builder.Services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
builder.Services.AddScoped<IBedTypeRepository, BedTypeRepository>();
builder.Services.AddScoped<ICancellationPolicyRepository, CancellationPolicyRepository>();
builder.Services.AddScoped<IVerificationTypeRepository, VerificationTypeRepository>();
builder.Services.AddScoped<IAmenityRepository, AmenityRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IHostRepository, HostRepository>();
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<IPropertyAmenityRepository, PropertyAmenityRepository>();
builder.Services.AddScoped<IPropertyPhotoRepository, PropertyPhotoRepository>();
builder.Services.AddScoped<ICalendarRepository, CalendarRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IHostVerificationRepository, HostVerificationRepository>();
builder.Services.AddScoped<ISavedListingRepository, SavedListingRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
// Service registrations
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IHostService, HostService>();
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<ICountryService, CountryService>();
builder.Services.AddScoped<ICityService, CityService>();

// CORS for React dev servers
const string CorsPolicy = "CorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://localhost:5173",
                "https://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Swagger / OpenAPI for API testing
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors(CorsPolicy);

app.UseAuthorization();

// Map attribute-routed API controllers
app.MapControllers();

// MVC default route (for views if you still use them)
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
