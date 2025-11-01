using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UITour.Models
{
    public class TourParticipant
    {
        [Key, Column(Order = 1)]
        [ForeignKey("Tour")]
        public int TourID { get; set; }
        public Tour Tour { get; set; }

        [Key, Column(Order = 2)]
        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.Now;

        [StringLength(50)]
        public string Status { get; set; } = "confirmed"; // pending, confirmed, cancelled
    }
}
