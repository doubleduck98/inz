using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace inz.Server.Models;

public class Booking
{
    public int Id { get; set; }
    public required int Hour { get; set; }
    public required DateOnly Date { get; set; }
    public string UserId { get; set; } = null!;
    public int RoomId { get; set; }
    public int PatientId { get; set; }

    public required User User { get; set; } = null!;
    public required Patient Patient { get; set; } = null!;
    public required Room Room { get; set; } = null!;
}

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");

        builder.HasKey(b => b.Id)
            .HasName("PK_BookingId");

        builder.HasIndex(b => b.Id)
            .IsUnique();

        builder.HasOne<User>(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Patient>(b => b.Patient)
            .WithMany(p => p.Bookings)
            .HasForeignKey(b => b.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Room>(b => b.Room)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}