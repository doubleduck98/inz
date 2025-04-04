using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace inz.Server.Models;

[EntityTypeConfiguration(typeof(RefreshTokenConfiguration))]
public class RefreshToken
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public required string Value { get; set; } = null!;
    public required DateTime ExpiresAtUtc { get; set; }
    
    public required User User { get; set; } = null!;
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");

        builder.HasKey(rt => rt.Id)
            .HasName("PK_RefreshTokenId");

        builder.HasIndex(rt => rt.Value)
            .IsUnique();

        builder.Property(rt => rt.UserId)
            .IsRequired();

        builder.Property(rt => rt.Value)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(rt => rt.ExpiresAtUtc)
            .IsRequired();

        builder.HasOne<User>(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();
    }
}