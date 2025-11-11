using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Review
    {
        [Key] public int ReviewID { get; set; }
        [ForeignKey("Property")] public int? PropertyID { get; set; }
        [ForeignKey("Booking")] public int? BookingID { get; set; }
        [ForeignKey("User")] public int? UserID { get; set; }
        public User User { get; set; }
        [Range(1, 5)] public byte Rating { get; set; }
        public string Comments { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
