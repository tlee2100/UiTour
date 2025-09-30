using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class City
    {
        [Key] 
        public int CityID { get; set; }
        [Required, StringLength(200)] 
        public string CityName { get; set; }
        [ForeignKey("Country")] 
        public int CountryID { get; set; }
        public Country Country { get; set; }
        public ICollection<Neighbourhood> Neighbourhoods { get; set; }
        public ICollection<Property> Properties { get; set; }
    }
}
