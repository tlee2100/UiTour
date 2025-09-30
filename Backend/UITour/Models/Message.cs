using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Message
    {
        [Key] public int MessageID { get; set; }
        [ForeignKey("FromUser")] public int? FromUserID { get; set; }
        [ForeignKey("ToUser")] public int? ToUserID { get; set; }
        [ForeignKey("Booking")] public int? BookingID { get; set; }
        [ForeignKey("Property")] public int? PropertyID { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; } = DateTime.Now; 
        public bool IsRead { get; set; } = false;
    }
}
