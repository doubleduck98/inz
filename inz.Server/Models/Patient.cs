using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace inz.Server.Models;

public class Patient
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Surname { get; set; }
    public required DateTime Dob { get; set; }
    public string? CoordinatingUserId { get; set; }

    public string? Email { get; set; }
    public string? Phone { get; set; }
    
    public required string Street { get; set; }
    public required string House { get; set; }
    public string? Apartment { get; set; }
    public required string ZipCode { get; set; }
    public required string Province { get; set; }
    public required string City { get; set; }

    public User? CoordinatingUser { get; set; }
    public List<PatientContact> Contacts { get; set; } = null!;
    public List<Document> Documents { get; set; } = null!;
    public List<Booking> Bookings { get; set; } = null!;
}

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.ToTable("Patients");

        builder.HasKey(p => p.Id)
            .HasName("PK_PatientId");

        builder.HasIndex(p => p.Id)
            .IsUnique();

        builder.Property(p => p.Name)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(p => p.Surname)
            .HasMaxLength(64)
            .IsRequired();

        builder.HasIndex(p => new { p.Name, p.Surname })
            .HasMethod("gin")
            .HasOperators("gin_trgm_ops")
            .HasDatabaseName("IX_PatientNameSurname");

        builder.Property(p => p.Dob)
            .HasColumnType("Date")
            .IsRequired();

        builder.Property(p => p.Email)
            .HasMaxLength(64);

        builder.Property(p => p.Phone)
            .HasMaxLength(64);

        builder.Property(p => p.Street)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(p => p.House)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(p => p.Apartment)
            .HasMaxLength(64);

        builder.Property(p => p.ZipCode)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(p => p.Province)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(p => p.City)
            .HasMaxLength(64)
            .IsRequired();

        builder.HasMany<PatientContact>(p => p.Contacts)
            .WithOne(g => g.Patient)
            .HasForeignKey(g => g.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<User>(p => p.CoordinatingUser)
            .WithMany(u => u.Patients)
            .HasForeignKey(p => p.CoordinatingUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany<Document>(p => p.Documents)
            .WithOne(d => d.Patient)
            .HasForeignKey(d => d.PatientId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}