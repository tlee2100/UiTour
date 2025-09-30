using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Review
    {
        [Key] public int ReviewID { get; set; }
        [ForeignKey("Property")] public int? PropertyID { get; set; }
        [ForeignKey("Booking")] public int? BookingID { get; set; }
        [ForeignKey("Reviewer")] public int? ReviewerID { get; set; }
        [Range(1, 5)] public byte Rating { get; set; }
        [Range(1, 5)] public byte Cleanliness { get; set; }
        [Range(1, 5)] public byte Communication { get; set; }
        [Range(1, 5)] public byte Accuracy { get; set; }
        [Range(1, 5)] public byte LocationRating { get; set; }
        [Range(1, 5)] public byte Value { get; set; }
        public string Comments { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
