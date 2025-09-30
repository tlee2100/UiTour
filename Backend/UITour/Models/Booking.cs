using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Booking
    {
        [Key] public int BookingID { get; set; }
        [Required][ForeignKey("Property")] public int PropertyID { get; set; }
        [Required][ForeignKey("Guest")] public int GuestID { get; set; }
        [Required][ForeignKey("Host")] public int HostID { get; set; }
        [Required] public DateTime CheckIn { get; set; }
        [Required] public DateTime CheckOut { get; set; }
        [Required] public int Nights { get; set; }
        [Required] public short GuestsCount { get; set; }
        [Required][Column(TypeName = "decimal(10,2)")] public decimal BasePrice { get; set; }
        [Column(TypeName = "decimal(10,2)")] public decimal CleaningFee { get; set; }
        [Column(TypeName = "decimal(10,2)")] public decimal ServiceFee { get; set; }
        [Required][Column(TypeName = "decimal(12,2)")] public decimal TotalPrice { get; set; }
        [MaxLength(10)] public string Currency { get; set; } = "USD"; [MaxLength(50)] public string Status { get; set; } = "pending"; public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
