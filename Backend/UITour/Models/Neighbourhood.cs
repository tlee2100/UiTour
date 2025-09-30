using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Neighbourhood
    {
        [Key] 
        public int NeighbourhoodID { get; set; }
        [Required, StringLength(200)] 
        public string NeighbourhoodName { get; set; }
        [ForeignKey("City")] 
        public int CityID { get; set; }
        public City City { get; set; }
        public ICollection<Property> Properties { get; set; }
    }
}
