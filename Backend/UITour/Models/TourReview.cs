using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UITour.Models
{
    public class TourReview
    {
        [Key]
        public int ReviewID { get; set; }

        [ForeignKey("Tour")]
        public int TourID { get; set; }
        public Tour Tour { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; }

        [Range(1, 5)]
        public byte Rating { get; set; }

        public string Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
