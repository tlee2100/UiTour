using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class CancellationPolicy
    {
        [Key] 
        public int CancellationID { get; set; }
        [Required, StringLength(100)] 
        public string PolicyName { get; set; }
        public string Description { get; set; }
        public ICollection<Property> Properties { get; set; }
    }
}
