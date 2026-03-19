// backend/AuthApi.Tests/AuthControllerTests.cs

// The testing framework being used is xUnit 
// also using Moq for creating mock objects.

using AuthApi.Controllers;
using AuthApi.Data;
using AuthApi.DTOs;
using AuthApi.Models;
using AuthApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace AuthApi.Tests;

public class AuthControllerTests
{
    // Helper method to create an in-memory database for testing.
    // EF Core supports "InMemory" provider — it behaves like a real DB 
    // but stores data in memory and is reset for each test.
    private static AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB per test
            .Options;
        return new AppDbContext(options);
    }

    // ── REGISTER TESTS ───

    [Fact]
    public async Task Register_WithValidData_ReturnsCreated()
    {
        // ARRANGE — set up everything needed for the test
        using var context = CreateInMemoryContext();
        
        // Moq creates a fake ITokenService that returns a predictable value
        var mockTokenService = new Mock<ITokenService>();
        mockTokenService
            .Setup(s => s.GenerateToken(It.IsAny<User>())) // "It.IsAny" = match any User
            .Returns("fake-jwt-token");

        var controller = new AuthController(context, mockTokenService.Object);

        var request = new RegisterRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Password = "password123"
        };

        // ACT — perform the action being tested
        var result = await controller.Register(request);

        // ASSERT — verify the outcome
        // Pattern matching: result is StatusCodeResult with 201 status
        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(201, statusResult.StatusCode);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsConflict()
    {
        // ARRANGE
        using var context = CreateInMemoryContext();
        
        // Pre-populate the DB with an existing user
        context.Users.Add(new User
        {
            FirstName = "Existing",
            LastName = "User",
            Email = "john@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password")
        });
        await context.SaveChangesAsync();

        var mockTokenService = new Mock<ITokenService>();
        var controller = new AuthController(context, mockTokenService.Object);

        var request = new RegisterRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com", // Same email — should fail
            Password = "password123"
        };

        // ACT
        var result = await controller.Register(request);

        // ASSERT
        Assert.IsType<ConflictObjectResult>(result);
    }

    // ── LOGIN TESTS ───

    [Fact]
    public async Task Login_WithCorrectCredentials_ReturnsOkWithToken()
    {
        // ARRANGE
        using var context = CreateInMemoryContext();
        var password = "correctpassword";
        
        context.Users.Add(new User
        {
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        });
        await context.SaveChangesAsync();

        var mockTokenService = new Mock<ITokenService>();
        mockTokenService
            .Setup(s => s.GenerateToken(It.IsAny<User>()))
            .Returns("valid-jwt-token");

        var controller = new AuthController(context, mockTokenService.Object);

        var request = new LoginRequest
        {
            Email = "jane@example.com",
            Password = password
        };

        // ACT
        var result = await controller.Login(request);

        // ASSERT
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponse>(okResult.Value);
        Assert.Equal("valid-jwt-token", response.Token);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // ARRANGE
        using var context = CreateInMemoryContext();
        
        context.Users.Add(new User
        {
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword")
        });
        await context.SaveChangesAsync();

        var mockTokenService = new Mock<ITokenService>();
        var controller = new AuthController(context, mockTokenService.Object);

        var request = new LoginRequest
        {
            Email = "jane@example.com",
            Password = "wrongpassword" // Wrong!
        };

        // ACT
        var result = await controller.Login(request);

        // ASSERT
        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}