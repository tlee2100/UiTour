using System;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models.DTO
{
    public class CreateBookingDto
    {
        public int? PropertyID { get; set; } // Nullable for tour bookings
        public int? TourID { get; set; } // Nullable for property bookings
        [Required] public int UserID { get; set; }
        [Required] public int HostID { get; set; }
        [Required] public DateTime CheckIn { get; set; }
        [Required] public DateTime CheckOut { get; set; }
        [Range(1, 365)] public int Nights { get; set; }
        [Range(1, 50)] public short GuestsCount { get; set; }
        [Range(0, double.MaxValue)] public decimal BasePrice { get; set; }
        [Range(0, double.MaxValue)] public decimal CleaningFee { get; set; }
        [Range(0, double.MaxValue)] public decimal ServiceFee { get; set; }
        [Range(0, double.MaxValue)] public decimal TotalPrice { get; set; }
        [StringLength(10)] public string Currency { get; set; } = "USD";
    }
}

