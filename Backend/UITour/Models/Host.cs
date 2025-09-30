using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Host
    {
        [Key] public int HostID { get; set; }
        [ForeignKey("User")] public int UserID { get; set; }
        public User User { get; set; }
        public DateTime? HostSince { get; set; }
        public string HostAbout { get; set; }
        public byte? HostResponseRate { get; set; }
        public bool IsSuperHost { get; set; }
        public ICollection<Property> Properties { get; set; }
        public ICollection<Booking> Bookings { get; set; }
        public ICollection<HostVerification> Verifications { get; set; }
    }
}
