using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Amenity
    {
        [Key] 
        public int AmenityID { get; set; }
        [Required, StringLength(100)] 
        public string AmenityName { get; set; }
        public ICollection<PropertyAmenity> PropertyAmenities { get; set; }
    }
}
