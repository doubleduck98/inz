using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace inz.Server.Models;

public class PatientContact
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int PatientId { get; set; }

    public required Patient Patient { get; set; }
}

public class PatientContactConfiguraation : IEntityTypeConfiguration<PatientContact>
{
    public void Configure(EntityTypeBuilder<PatientContact> builder)
    {
        builder.ToTable("PatientContacts");

        builder.HasKey(g => g.Id)
            .HasName("PK_PatientContactId");

        builder.HasIndex(g => g.Id);

        builder.Property(g => g.Name)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(g => g.Email)
            .HasMaxLength(64);

        builder.Property(g => g.Phone)
            .HasMaxLength(64);

        builder.HasOne<Patient>(g => g.Patient)
            .WithMany(p => p.Contacts)
            .HasForeignKey(g => g.PatientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}