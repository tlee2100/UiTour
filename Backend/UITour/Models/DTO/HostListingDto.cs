namespace UITour.Models.DTO
{
    public class HostListingDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? ImageUrl { get; set; }
        public double Rating { get; set; }
        public string Status { get; set; }
        public string Type { get; set; } // "Property" or "Tour"
        public DateTime CreatedAt { get; set; }
    }
}

