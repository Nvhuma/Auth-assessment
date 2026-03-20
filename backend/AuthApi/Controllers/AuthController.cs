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
        // ASP.NET Core automatically validates the model based on data annotations in RegisterDto
        // No need to check ModelState.IsValid manually here because of [ApiController]

        // check if email is already taken
        // "async/await" allows the server to handle other requests while waiting for the database operation to complete
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        if (existingUser != null)
        {
            // 409 Conflict = semantically correct for "resource already exists"
            return Conflict(new { message = "A user with this email already exists" });
        }

        // hash the password before saving to the database
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
        var token = _tokenService.GenerateToken(user);

        //201 Created is the semantically correct status code for a successful resource creation
        //return the token in the response body so the client can use it immediately after registration
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
    }

    //Post: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Find user by email (stored lowercase, so compare lowercase)
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        // STEP 1: Check user exists AND password is correct FIRST
        // We check both in one condition to prevent user enumeration attacks —
        // never tell the attacker whether the email or password was wrong
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // STEP 2: Reset logout flag — user is logging back in
        // This only runs if user exists and password is correct
        user.IsLoggedOut = false;
        await _context.SaveChangesAsync();

        // STEP 3: Generate and return the token
        var token = _tokenService.GenerateToken(user);

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
    }

    //Get: api/auth/me
    // client must include a valid JWT token in the Authorization header to access this endpoint
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        //User.FindFirst() reads claims from the validated JWT
        // Middleware decodes the token and populates
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

        // Reject requests from users who have logged out
        // Even if the JWT is still valid, the server-side flag blocks access
        if (user.IsLoggedOut)
        {
            return Unauthorized(new { message = "Token has been invalidated. Please log in again." });
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

    // POST: api/auth/logout
    // Invalidates the user's token server-side by setting IsLoggedOut = true
    // Even if someone has a copy of the JWT, it won't work after this
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        // Read the user ID from the JWT claims
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                   ?? User.FindFirst("sub");

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Mark user as logged out in the database
        user.IsLoggedOut = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Logged out successfully" });
    }
}