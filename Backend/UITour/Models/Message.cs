using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Message
    {
        [Key] public int MessageID { get; set; }
        [ForeignKey("FromUser")] public int? FromUserID { get; set; }
        public User FromUser { get; set; }
        [ForeignKey("ToUser")] public int? ToUserID { get; set; }
        public User ToUser { get; set; }
        [ForeignKey("Booking")] public int? BookingID { get; set; }
        public Booking Booking { get; set; }

        [Required, MaxLength(2000)]
        public string Content { get; set; }
        public DateTime SentAt { get; set; } = DateTime.Now; 
        public bool IsRead { get; set; } = false;
    }
}
