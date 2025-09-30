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
        public ICollection<Host> Hosts { get; set; }
        public ICollection<Booking> Bookings { get; set; }
        public ICollection<Message> SentMessages { get; set; }
        public ICollection<Message> ReceivedMessages { get; set; }
        public ICollection<SavedListing> SavedListings { get; set; }
        public ICollection<Review> Reviews { get; set; }
    }
}
