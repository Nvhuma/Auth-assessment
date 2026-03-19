// TokenService's only job: create and manage JWT token
// Single Responsibility Principle (SRP) — each class does ONE thing.
// If there is a  need to change how tokens are generated,  only touch THIS file.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace AuthApi.Services;

public interface ITokenService
{
    // Define an interface so we can mock this in tests.
    // "Program to interfaces, not implementations" — Dependency Inversion Principle (DIP)
    string GenerateToken(User user);
}

public class TokenService : ITokenService
{
    // IConfiguration gives us access to appsettings.json and environment variables
    private readonly IConfiguration _configuration;

    //constructor injection
    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        // 3part JWT token: header, payload, signature
        // The payload is where we put the "claims" — info about the user that we want to include in the token.
        var claims = new[]
        {
            //"sub" = who the token is about (the user id in this case)
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            //"email" claim - the client can read this from the token
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            //"jti" (JWT ID) = unique ID for this token — helps with token revocation
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            //custom claims for convenience
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName)
        };

        //The signing key is used to create the signature part of the JWT token.
        //The client can verify the signature using the same key, but they can't read the key itself.
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
        );

        //Algorithm used to sign = HMAC-SHA256
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        //Create the token
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8), //token expires in 8 hours
            signingCredentials: creds
        );

        //Serialize the token to a string and return it
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}