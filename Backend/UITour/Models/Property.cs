using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace UITour.Models
{
    public class Property
    {
        [Key] public int PropertyID { get; set; }
        [ForeignKey("Host")] public int HostID { get; set; }
        public Host Host { get; set; }
        [Required, StringLength(200)] public string ListingTitle { get; set; }
        public string Description { get; set; }
        public string Summary { get; set; }
        public string Location { get; set; }
        [ForeignKey("Neighbourhood")] public int? NeighbourhoodID { get; set; }
        public Neighbourhood Neighbourhood { get; set; }
        [ForeignKey("City")] public int? CityID { get; set; }
        public City City { get; set; }
        [ForeignKey("Country")] public int? CountryID { get; set; }
        public Country Country { get; set; }
        [ForeignKey("RoomType")] public int? RoomTypeID { get; set; }
        public RoomType RoomType { get; set; }
        [ForeignKey("BedType")] public int? BedTypeID { get; set; }
        public BedType BedType { get; set; }
        public short? Bedrooms { get; set; }
        public short? Beds { get; set; }
        public decimal? Bathrooms { get; set; }
        public short? Accommodates { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public decimal? CleaningFee { get; set; }
        public decimal? ExtraPeopleFee { get; set; }
        public int? SquareFeet { get; set; }
        public bool IsBusinessReady { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Active { get; set; }
        [ForeignKey("CancellationPolicy")] public int? CancellationID { get; set; }
        public CancellationPolicy CancellationPolicy { get; set; }
        public ICollection<PropertyAmenity> PropertyAmenities { get; set; }
        public ICollection<Calendar> Calendars { get; set; }
        public ICollection<Booking> Bookings { get; set; }
        public ICollection<PropertyPhoto> Photos { get; set; }
        public ICollection<SavedListing> SavedListings { get; set; }
        public ICollection<Review> Reviews { get; set; }
    }
}
