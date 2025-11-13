using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UITour.Models
{
    public class ExperienceDetails
    {
        [Key]
        public int DetailID { get; set; }

        [ForeignKey("Tour")]
        public int TourID { get; set; }
        public Tour Tour { get; set; }

        [StringLength(1000)]
        public string ImageUrl { get; set; }

        [Required, StringLength(300)]
        public string Title { get; set; }

        public string Description { get; set; }

        public int SortIndex { get; set; } = 0;
    }
}
