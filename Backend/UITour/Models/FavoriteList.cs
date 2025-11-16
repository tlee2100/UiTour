using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UITour.Models
{
    [Table("favorite_lists")]
    public class FavoriteList
    {
        [Key]
        [StringLength(50)]
        public string ListID { get; set; } = string.Empty;
        
        [ForeignKey("User")]
        public int UserID { get; set; }
        
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(255)]
        public string? CoverImage { get; set; }
        
        public int ItemsCount { get; set; }
    }
}

