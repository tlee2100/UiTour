using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UITour.Models
{
    public class TourPhoto
    {
        [Key]
        public int PhotoID { get; set; }

        [ForeignKey("Tour")]
        public int TourID { get; set; }
        public Tour Tour { get; set; }

        [Required, StringLength(500)]
        public string Url { get; set; }

        [StringLength(300)]
        public string Caption { get; set; }

        public int SortIndex { get; set; } = 0;
    }
}
