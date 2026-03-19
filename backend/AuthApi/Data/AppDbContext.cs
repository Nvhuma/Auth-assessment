// Keepimg data access separated from the business logic

using AuthApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Data;

//Inherit from DbContext, which is the primary class responsible for interacting with the database in Entity Framework Core.

public class AppDbContext : DbContext
{
    //Constructor that takes DbContextOptions and passes it to the base class constructor
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSet for the User entity
    public DbSet<User> Users { get; set; }

    //OnModelCreating is a method that allows   configuring the model using the Fluent API.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure the User entity
        modelBuilder.Entity<User>(entity =>
        {
            // Set the Email property to be unique
            entity.HasIndex(u => u.Email).IsUnique();
        });
    }
}