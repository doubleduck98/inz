using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace inz.Server.Models;

public class Room
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public List<Booking> Bookings { get; set; } = null!;
}

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable("Rooms");

        builder.HasKey(r => r.Id)
            .HasName("PK_RoomId");

        builder.HasIndex(r => r.Id)
            .IsUnique();

        builder.HasIndex(r => r.Name)
            .IsUnique();

        builder.Property(r => r.Name)
            .HasMaxLength(127);
    }
}