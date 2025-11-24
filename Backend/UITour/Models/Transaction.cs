using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Transaction
    {
        [Key] 
        public int TransactionID { get; set; }
        
        [Required]
        [ForeignKey("Booking")]
        public int BookingID { get; set; }
        public Booking Booking { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal Amount { get; set; }
        
        [MaxLength(10)]
        public string Currency { get; set; } = "USD";
        
        [MaxLength(50)]
        public string? PaymentMethod { get; set; }
        
        [MaxLength(50)]
        public string? PaymentStatus { get; set; }
        
        public DateTime ProcessedAt { get; set; } = DateTime.Now;
        
        // Additional fields from database schema
        [MaxLength(500)]
        public string? QRCodeUrl { get; set; }
        
        [MaxLength(50)]
        public string? ApprovalStatus { get; set; } = "pending";
        
        [ForeignKey("ApprovedByUser")]
        public int? ApprovedBy { get; set; }
        public User? ApprovedByUser { get; set; }
        
        public DateTime? ApprovedAt { get; set; }
        
        public string? ApprovalNote { get; set; }
        
        [MaxLength(10)]
        public string? OriginalCurrency { get; set; }
        
        [Column(TypeName = "decimal(12,2)")]
        public decimal? OriginalAmount { get; set; }
        
        [Column(TypeName = "decimal(10,4)")]
        public decimal? ExchangeRate { get; set; }
        
        public string? CurrencyConversionNote { get; set; }
        
        [MaxLength(200)]
        public string? BankAccount { get; set; }
        
        [MaxLength(100)]
        public string? BankName { get; set; }
        
        [MaxLength(200)]
        public string? TransactionContent { get; set; }
    }
}
