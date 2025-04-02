using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace inz.Server.Models;

[Table("RefreshTokens")]
[EntityTypeConfiguration(typeof(RefreshTokenConfiguration))]
public class RefreshToken
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string UserId { get; set; }
    [MaxLength(128)]
    public string Value { get; set; } = null!;
    public DateTime ExpiresAtUtc { get; set; }
    
    public required User User { get; set; } = null!;
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(rt => rt.Id)
            .HasName("PK_RefreshTokenId");
        builder.HasIndex(rt => rt.Value).IsUnique();
        builder.HasOne<User>(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();
    }
}