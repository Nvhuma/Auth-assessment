using System.ComponentModel.DataAnnotations;

namespace AuthApi.DTOs;

//──DTOs (what the clients send to us)──    


public class RegisterRequest
{
    //[Required] = Validation attribute. ASP .net core automatically returns
    //a 400 Bad Request response if the client fails to provide a value for this property.
    [Required(ErrorMessage = "First name is required")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Last name is required")]
    public string LastName { get; set; } = string.Empty;

    //[EmailAddress] = Validation attribute that checks if the provided string is in a valid email format. If not, it will return a 400 Bad Request response with an error message.
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    // [MinLength] ensures the password isn't trivially weak
    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
    public string Password { get; set; } = string.Empty;

}

public class LoginRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;
}

// ── OUTBOUND DTOs (what we send back to the client) ───────

public class AuthResponse
{
    // The JWT token the client will store and send with future requests to authenticate themselves.
    public string Token { get; set; } = string.Empty;

    //We return basic user info so the client/frontend doesnt need a second API call
    public UserDto User { get; set; } = new UserDto();
}

public class UserDto
{
    //Notice: NO password here! We never want to send password hashes back to the client.
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}