using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class PropertyPhoto
    {
        [Key] public int PhotoID { get; set; }
        [Required][ForeignKey("Property")] public int PropertyID { get; set; }
        [Required][MaxLength(500)] public string Url { get; set; }
        [MaxLength(300)] public string Caption { get; set; }
        public int SortIndex { get; set; } = 0;
    }
}
