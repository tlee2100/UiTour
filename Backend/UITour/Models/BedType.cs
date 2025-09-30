using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class BedType
    {
        [Key] 
        public int BedTypeID { get; set; }
        [Required, StringLength(100)] 
        public string Name { get; set; }
        public ICollection<Property> Properties { get; set; }
    }
}
