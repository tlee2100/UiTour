using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using UITour.Models;

namespace UITour.Models
{
    public class SavedListings
{
    public int UserID { get; set; }
    public int PropertyID { get; set; }
    public string ListID { get; set; }  // Mới thêm
    public DateTime SavedAt { get; set; }

    // Navigation properties (nếu dùng Entity Framework)
    public User User { get; set; }
    public Property Property { get; set; }
    public FavoriteList FavoriteList { get; set; }  // Nếu có bảng FavoriteList
}

}
