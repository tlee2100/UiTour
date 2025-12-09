using System.Runtime.CompilerServices;
using UITour.Models.DTO;

public class UpdateTourDto
{
    public string TourName { get; set; }
    //public string Summary { get; set; }
    public string Description { get; set; }
    public string MainCategory { get; set; }
    public int DurationDays { get; set; }

    public string Location { get; set; }
    public decimal Price { get; set; }
    public int MaxGuests { get; set; } 
    public List<ExperienceDetailDto> ExperienceDetails { get; set; }
    public List<TourPhotoDto> Photos { get; set; }
}