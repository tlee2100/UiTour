using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UITour.Models
{
    public class SavedListings
    {
        [Key]
        public int SavedListingID { get; set; }

        [Required]
        public int UserID { get; set; }

        public int? PropertyID { get; set; }
        public int? TourID { get; set; }

        [Required, StringLength(32)]
        public string ItemType { get; set; } = "property";

        public string ListID { get; set; }
        public DateTime SavedAt { get; set; }

        public User User { get; set; }
        public Property Property { get; set; }
        public Tour Tour { get; set; }
        public FavoriteList FavoriteList { get; set; }
    }
}
