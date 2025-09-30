using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class Calendar
    {
        [Key] public int CalendarID { get; set; }
        [Required][ForeignKey("Property")] public int PropertyID { get; set; }
        [Required] public DateTime Date { get; set; }
        [Column(TypeName = "decimal(10,2)")] public decimal? Price { get; set; }
        public bool Available { get; set; } = true; 
        public short MinNights { get; set; } = 1; 
        public short MaxNights { get; set; } = 30; 
        public DateTime LastModified { get; set; } = DateTime.Now;
    }
}
