using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace inz.Server.Models;

[EntityTypeConfiguration(typeof(DocumentConfiguration))]
public class Document
{
    public int Id { get; set; }
    public string? OwnerId { get; set; }
    public required string FileName { get; set; } = null!;
    public required string SourcePath { get; set; } = null!;
    public DateTime LastEditUtc { get; set; }
    public DateTime? DeletedOnUtc { get; set; }
    public int? PatientId { get; set; }

    public User? User { get; set; }
    public Patient? Patient { get; set; }
}

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("Documents");

        builder.HasKey(d => d.Id)
            .HasName("PK_DocumentId");

        builder.HasIndex(d => d.Id)
            .IsUnique();

        builder.Property(d => d.FileName)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(d => d.SourcePath)
            .HasMaxLength(128)
            .IsRequired();

        builder.HasQueryFilter(d => !d.DeletedOnUtc.HasValue);

        builder.HasOne<User>(d => d.User)
            .WithMany(u => u.Documents)
            .HasForeignKey(d => d.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Patient>(d => d.Patient)
            .WithMany(p => p.Documents)
            .HasForeignKey(d => d.PatientId)
            .OnDelete(DeleteBehavior.ClientSetNull);
    }
}