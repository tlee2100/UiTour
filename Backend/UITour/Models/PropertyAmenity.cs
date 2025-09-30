using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class PropertyAmenity
    {
        [Key, Column(Order = 1)][ForeignKey("Property")] public int PropertyID { get; set; }
        [Key, Column(Order = 2)][ForeignKey("Amenity")] public int AmenityID { get; set; }
        public short Quantity { get; set; } = 1;
    }
}
