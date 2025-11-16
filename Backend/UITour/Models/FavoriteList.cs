using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using UITour.Models;

public class FavoriteList
{
    [Key]
    public string ListID { get; set; }
    public int UserID { get; set; }
    public string Title { get; set; }
    public string CoverImage { get; set; }
    public int ItemsCount { get; set; }

    // Navigation property
    public User User { get; set; }
    public ICollection<SavedListings> SavedListings { get; set; }
}
