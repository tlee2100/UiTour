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
        public DbSet<SavedListings> SavedListings { get; set; }

        // ================= Messages =================
        public DbSet<Message> Messages { get; set; }

        // ================= Tours =================
        public DbSet<Tour> Tours { get; set; }                
        public DbSet<TourReview> TourReviews { get; set; }   
        public DbSet<TourPhoto> TourPhotos { get; set; }
        public DbSet<ExperienceDetails> ExperienceDetails { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PropertyAmenity>()
                .HasKey(pa => new { pa.PropertyID, pa.AmenityID });

            modelBuilder.Entity<PropertyAmenity>()
                .HasOne(pa => pa.Property)
                .WithMany(p => p.PropertyAmenities)
                .HasForeignKey(pa => pa.PropertyID);

            modelBuilder.Entity<PropertyAmenity>()
                .HasOne(pa => pa.Amenity)
                .WithMany(a => a.PropertyAmenities)
                .HasForeignKey(pa => pa.AmenityID);

            // Nếu cần mapping thêm (ví dụ decimal precision)
            modelBuilder.Entity<Property>()
                .Property(p => p.Price)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalPrice)
                .HasColumnType("decimal(12,2)");
            
            modelBuilder.Entity<Tour>()
              .Property(t => t.Price)
              .HasColumnType("decimal(10,2)");

            // Relationships
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Property)
                .WithMany(p => p.Bookings)
                .HasForeignKey(b => b.PropertyID)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false); // Make PropertyID optional for tour bookings

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Tour)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.TourID)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false); // Make TourID optional for property bookings

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserID)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Host)
                .WithMany(h => h.Bookings)
                .HasForeignKey(b => b.HostID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Host>()
                .HasMany(h => h.Properties)
                .WithOne(p => p.Host)
                .HasForeignKey(p => p.HostID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Host>()
                .HasMany(h => h.Verifications)
                .WithOne(v => v.Host)
                .HasForeignKey(v => v.HostID)
                .OnDelete(DeleteBehavior.Restrict);

            
           

            modelBuilder.Entity<Tour>()
                .HasOne(t => t.Host)
                .WithMany(h => h.Tours) // bạn có thể thêm ICollection<Tour> Tours vào model Host
                .HasForeignKey(t => t.HostID)
                .OnDelete(DeleteBehavior.Restrict);

            
            modelBuilder.Entity<TourReview>()
                .HasOne(tr => tr.Tour)
                .WithMany(t => t.Reviews)
                .HasForeignKey(tr => tr.TourID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TourReview>()
                .HasOne(tr => tr.User)
                .WithMany()
                .HasForeignKey(tr => tr.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            // Tour - Photo
            modelBuilder.Entity<TourPhoto>()
                .HasOne(tp => tp.Tour)
                .WithMany(t => t.Photos)
                .HasForeignKey(tp => tp.TourID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ExperienceDetails>()
                .HasOne(ed => ed.Tour)
                .WithMany(t => t.ExperienceDetails)
                .HasForeignKey(ed => ed.TourID)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<SavedListings>()
                .HasKey(sl => sl.SavedListingID);

            modelBuilder.Entity<SavedListings>()
                .HasOne(sl => sl.User)
                .WithMany(u => u.SavedListings)
                .HasForeignKey(sl => sl.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedListings>()
                .HasOne(sl => sl.Property)
                .WithMany(p => p.SavedListings)
                .HasForeignKey(sl => sl.PropertyID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedListings>()
                .HasOne(sl => sl.Tour)
                .WithMany()
                .HasForeignKey(sl => sl.TourID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedListings>()
                .HasOne(sl => sl.FavoriteList)
                .WithMany(fl => fl.SavedListings)
                .HasForeignKey(sl => sl.ListID);

            modelBuilder.Entity<FavoriteList>()
                .HasKey(fl => fl.ListID);

            modelBuilder.Entity<Message>()
                .HasIndex(m => new { m.FromUserID, m.ToUserID, m.SentAt });
            modelBuilder.Entity<Message>()
                .HasOne(m => m.FromUser)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.FromUserID)
                .OnDelete(DeleteBehavior.Restrict); // tránh xóa cascade

            modelBuilder.Entity<Message>()
                .HasOne(m => m.ToUser)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ToUserID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

