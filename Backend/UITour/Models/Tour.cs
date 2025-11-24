using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UITour.Models
{
    public class Tour
    {
        [Key]
        public int TourID { get; set; }

        [ForeignKey("Host")]
        public int HostID { get; set; }
        public Host Host { get; set; }

        [Required, StringLength(300)]
        public string TourName { get; set; }

        public string Description { get; set; }
        public string Location { get; set; }

        [ForeignKey("City")]
        public int CityID { get; set; }
        public City City { get; set; }

        [ForeignKey("Country")]
        public int CountryID { get; set; }
        public Country Country { get; set; }

        public int DurationDays { get; set; } = 1;
        public int MaxGuests { get; set; } = 10;

        [Required]
        public decimal Price { get; set; }

        [StringLength(10)]
        public string Currency { get; set; } = "USD";

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public bool Active { get; set; } = true;

        [ForeignKey("CancellationPolicy")]
        public int? CancellationID { get; set; }
        public CancellationPolicy CancellationPolicy { get; set; }

        // Navigation properties

        public ICollection<TourPhoto> Photos { get; set; }
        public ICollection<TourReview> Reviews { get; set; }
        public ICollection<ExperienceDetails> ExperienceDetails { get; set; }
        public ICollection<Booking> Bookings { get; set; }

    }
}
