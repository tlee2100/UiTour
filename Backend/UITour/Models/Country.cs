using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Country
    {
        [Key] 
        public int CountryID { get; set; }
        [Required, StringLength(200)] 
        public string CountryName { get; set; }
        public ICollection<City> Cities { get; set; }
        public ICollection<Property> Properties { get; set; }
    }
}
