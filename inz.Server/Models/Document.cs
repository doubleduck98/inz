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
    public required FileType FileType { get; set; }
    public required DateTime AddedOnUtc { get; set; }
    public DateTime LastEditUtc { get; set; }

    public User? User { get; set; }
}

// fix to potem
public enum FileType
{
    PdfFile,
    DocFile,
    DocxFile,
    TxtFile,
    Unknown
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
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(d => d.FileType)
            .IsRequired();

        builder.Property(d => d.AddedOnUtc)
            .IsRequired();

        builder.HasOne<User>(d => d.User)
            .WithMany(u => u.Documents)
            .HasForeignKey(d => d.OwnerId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}