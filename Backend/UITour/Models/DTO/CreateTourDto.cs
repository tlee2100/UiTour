namespace UITour.Models.DTO
{
    public class CreateTourDto
    {
        public int UserID { get; set; } // UserID - sẽ tự động tạo Host nếu chưa có
        public string TourName { get; set; }
        public string Description { get; set; }
        public string Summary { get; set; }
        public string Location { get; set; }
        public int? CityID { get; set; }
        public int? CountryID { get; set; }
        public int DurationDays { get; set; } = 1;
        public int? DurationHours { get; set; }
        public int MaxGuests { get; set; } = 10;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool Active { get; set; } = false; // Default to false (pending approval)
        public int? CancellationID { get; set; }
        public string lat { get; set; }
        public string lng { get; set; }
        public string MainCategory { get; set; }
        public string Qualifications { get; set; }
        public List<TourPhotoDto> Photos { get; set; }
        public string CoverPhoto { get; set; }
        public List<string> TimeSlots { get; set; }
        public List<ExperienceDetailDto> ExperienceDetails { get; set; }
    }

    public class TourPhotoDto
    {
        public string Url { get; set; }
        public string Caption { get; set; }
        public int SortIndex { get; set; }
    }

    public class ExperienceDetailDto
    {
        public string ImageUrl { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int SortIndex { get; set; }
    }
}

