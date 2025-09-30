using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class SavedListing
    {
        [Key, Column(Order = 1)][ForeignKey("User")] public int UserID { get; set; }
        [Key, Column(Order = 2)][ForeignKey("Property")] public int PropertyID { get; set; }
        public DateTime SavedAt { get; set; } = DateTime.Now;
    }
}
