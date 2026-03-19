// This is a "Thin Controller, Fat Service" pattern

using AuthApi.Data;
using AuthApi.DTOs;
using AuthApi.Models;
using AuthApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Controllers;

// [ApiController] enables: automatic model validation, automatic 400 responses,
// binding source inference (knows JSON body vs query string vs route param)
[ApiController]

//[Route] defines the URL prefix. "Api/auth
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Injecting the DBContext and TokenService into the controller
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Implementation for user registration
        // ASP.NET Core automatically validates the model based on data annotations in RegisterDto
        //No need to check ModelState.IsValid manually here because of [ApiController]

        //check if email is already taken
        //"aync/await" allows the server to handle other requests while waiting for the database operation to complete
        // critical scalability.
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        if (existingUser != null)
        {
            // 409 Conflict = semantically correct for "resource already exists"
            return Conflict(new { message = "A user with this email already exists" });
        }

        //hash the password before saving to the database
        // BCrypt.HashPassword generates a salt + hash in one call.
        // The salt is embedded in the resulting string — we don't manage it separately.
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email.ToLower().Trim(), // Normalize email
            PasswordHash = hashedPassword
        };

        // add the user to EF Core's change tracker and save to the database
        _context.Users.Add(user);

        // SaveChangesAsync returns the number of state entries written to the database
        await _context.SaveChangesAsync();

        //Generating a JWT token for the newly registered user
        var token = _tokenService.GenerateToken(user); // ✅ FIX: GenerateToken (not GenerationToken)

        //201 Created is the semantically correct status code for a successful resource creation
        // we also return the token in the response body so the client can use it immediately after registration
        return StatusCode(201, new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email
            }
        });
    } // ✅ FIX: Register method closes HERE — Login is no longer nested inside

    //Post: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Implementation for user login
        // Similar to registration, we validate the model and check credentials

        // Find user by email (we stored emails lowercase, so compare lowercase)
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            // 401 Unauthorized =  failed authentication
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var token = _tokenService.GenerateToken(user); // ✅ FIX: GenerateToken (not GenerationToken)

        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email
            }
        });
    } // ✅ Login closes here

    //Get: api/auth/profile
    //[Authorize] means the client must include a valid JWT token in the Authorization header to access this endpoint
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        //User.findFirst() reads claims from the validated Jwt
        // Midlleware decodes the token and populates
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                   ?? User.FindFirst("sub");

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            // User was deleted after the token was issued
            return NotFound(new { message = "User not found" });
        }

        // Return user info (without password hash) so the client can display it in the UI
        return Ok(new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email
        });
    } 

}