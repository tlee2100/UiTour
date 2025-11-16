using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class User
    {
        [Key] public int UserID { get; set; }
        [Required, StringLength(200)] public string Email { get; set; }
        [Required, StringLength(200)] public string FullName { get; set; }
        [StringLength(20)] public string Phone { get; set; }
        public DateTime RegisteredAt { get; set; }
        [StringLength(200)] public string? PasswordHash { get; set; }

        public string? UserAbout { get; set; }

        // Role (Giới hạn 20 ký tự như trong SQL)
        [StringLength(20)] public string? Role { get; set; }

        // Age (Tương đương int trong SQL)
        public int? Age { get; set; }

        // Gender (Giới hạn 20 ký tự như trong SQL)
        [StringLength(20)] public string? Gender { get; set; }

        // Nationality (Giới hạn 100 ký tự như trong SQL)
        [StringLength(100)] public string? Nationality { get; set; }

        // Interests (Tương đương NVARCHAR(MAX) trong SQL, lưu dưới dạng chuỗi)
        // Lưu ý: Nếu bạn dùng JSON/JSONB trong DB, bạn vẫn lưu nó là string ở đây,
        // hoặc có thể dùng kiểu List<string> và cấu hình Value Converter trong DbContext.
        public string? Interests { get; set; }
        public ICollection<Host> Hosts { get; set; }
      
        public ICollection<Booking> Bookings { get; set; }
        public ICollection<Message> SentMessages { get; set; }
        public ICollection<Message> ReceivedMessages { get; set; }
        public ICollection<SavedListings> SavedListings { get; set; }
        public ICollection<Review> Reviews { get; set; }

   
    }
}
