using Microsoft.EntityFrameworkCore;

namespace UITour.Models
{
    public class UITourContext : DbContext
    {
        public UITourContext(DbContextOptions<UITourContext> options)
            : base(options)
        {
        }

        // ================= Reference tables =================
        public DbSet<Country> Countries { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Neighbourhood> Neighbourhoods { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<BedType> BedTypes { get; set; }
        public DbSet<CancellationPolicy> CancellationPolicies { get; set; }
        public DbSet<VerificationType> VerificationTypes { get; set; }
        public DbSet<Amenity> Amenities { get; set; }

        // ================= Users & Hosts =================
        public DbSet<User> Users { get; set; }
        public DbSet<Host> Hosts { get; set; }

        // ================= Properties / Listings =================
        public DbSet<Property> Properties { get; set; }
        public DbSet<PropertyAmenity> PropertyAmenities { get; set; }
        public DbSet<PropertyPhoto> PropertyPhotos { get; set; }

        // ================= Calendar / Availability =================
        public DbSet<Calendar> Calendars { get; set; }

        // ================= Bookings & Transactions =================
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        // ================= Reviews =================
        public DbSet<Review> Reviews { get; set; }

        // ================= Host Verifications =================
        public DbSet<HostVerification> HostVerifications { get; set; }

        // ================= Saved Listings =================
        public DbSet<SavedListing> SavedListings { get; set; }

        // ================= Messages =================
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite keys
            modelBuilder.Entity<PropertyAmenity>()
                .HasKey(pa => new { pa.PropertyID, pa.AmenityID });

            modelBuilder.Entity<SavedListing>()
                .HasKey(sl => new { sl.UserID, sl.PropertyID });

            // Nếu cần mapping thêm (ví dụ decimal precision)
            modelBuilder.Entity<Property>()
                .Property(p => p.Price)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalPrice)
                .HasColumnType("decimal(12,2)");
        }
    }
}

