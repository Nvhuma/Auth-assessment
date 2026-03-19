// backend/AuthApi/Program.cs

using System.Text;
using AuthApi.Data;
using AuthApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register our TokenService.
// ITokenService → TokenService: when something asks for ITokenService, give them TokenService
builder.Services.AddScoped<ITokenService, TokenService>();

// Configure JWT Authentication
// This tells ASP.NET Core: "Expect JWT Bearer tokens in the Authorization header"
// Format: Authorization: Bearer <token>
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // Validate that the token was issued by OUR server (not forged by someone else)
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            // Validate that the token is intended for OUR app
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            // Validate the expiry time — reject expired tokens
            ValidateLifetime = true,

            // Validate the signature — MOST IMPORTANT. Proves we signed it.
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });

builder.Services.AddAuthorization();

// CORS = Cross-Origin Resource Sharing
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",  // React dev server
                "http://frontend:3000"    // Docker container name
            )
            .AllowAnyHeader()   // Allow any request header (e.g., Authorization, Content-Type)
            .AllowAnyMethod();  // Allow GET, POST, PUT, DELETE, etc.
    });
});

var app = builder.Build();

// Auto-migrate database on startup.
// It creates the database and tables if they don't exist.
// In production you'd run migrations manually, but for development/Docker this is convenient.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// CORS must come BEFORE routing and authentication
// Otherwise the browser's preflight OPTIONS request gets rejected before CORS runs
app.UseCors("AllowFrontend");

// UseAuthentication = reads and validates the JWT token
// UseAuthorization = checks if the validated user has permission (the [Authorize] attribute)
// ORDER IS CRITICAL: Authenticate first, then Authorize
app.UseAuthentication();
app.UseAuthorization();

// Map controller routes — connects URL patterns to controller actions
app.MapControllers();

app.Run();

// Make Program class accessible for integration tests
public partial class Program { }