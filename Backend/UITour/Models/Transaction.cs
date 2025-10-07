namespace UITour.Models
{
    public class Transaction
    {
        public int TransactionID { get; set; }
        public int BookingID { get; set; }
        public Booking Booking { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime ProcessedAt { get; set; }
    }
}
