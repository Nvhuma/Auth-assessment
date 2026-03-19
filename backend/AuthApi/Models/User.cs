// backend/AuthApi/Models/User.cs

namespace AuthApi.Models;


public class User
{  
    //Primary key - EF core convention: property named "Id" or "<ClassName>Id" is treated as primary key
    public int Id { get; set; }
    
    // "required" attribute indicates that the property must have a value (cannot be null)
    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    //Adding a unique contraint on this in my DBContext to ensure no duplicate emails
    public required string Email { get; set; }

    //Important: never store passwords in plain text.
    //Feild stores the BYcrypt hash of the user's password, not the actual password.
    public required string PasswordHash { get; set; }

    //Audit field
    //"DateTime" . UTC =  Coordinated Universal Time, a standard time format that is not affected by time zones or daylight saving time.
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
