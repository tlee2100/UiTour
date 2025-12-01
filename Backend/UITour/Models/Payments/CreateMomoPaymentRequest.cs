using System.ComponentModel.DataAnnotations;

namespace UITour.Models.Payments
{
    public class CreateMomoPaymentRequest
    {
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
        public decimal AmountUsd { get; set; }

        [Range(0.0, double.MaxValue)]
        public decimal? AmountVnd { get; set; }

        public int? BookingId { get; set; }

        [MaxLength(64)]
        public string? OrderId { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        [MaxLength(2048)]
        public string? ReturnUrl { get; set; }
    }
}

