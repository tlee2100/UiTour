public class TourDto
{
    public int TourID { get; set; }
    public int HostID { get; set; }
    public string TourName { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public int CityID { get; set; }
    public int CountryID { get; set; }
    public int DurationDays { get; set; }
    public int MaxGuests { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool Active { get; set; }
}
