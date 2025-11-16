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

        [StringLength(100)]
        public string PropertyType { get; set; }
        public bool selfCheckIn { get; set; } = true;
        public bool enhancedClean { get; set; } = true;
        public bool freeCancellation { get; set; } = true;
        [StringLength(100)]
        public string checkin_after { get; set; }
        [StringLength(100)]
        public string self_checkin_method { get; set; }
        public bool no_smoking { get; set; } = true;
        public bool no_open_flames { get; set; } = true;
        public bool pets_allowed { get; set; } = true;
        public string lat { get; set; }
        public string lng { get; set; }
        public decimal ServiceFee { get; set; } = 0;
        public decimal TaxFee { get; set; } = 0;
        public decimal Discount { get; set; } = 0;
        public decimal DiscountPercentage { get; set; } = 0;
        [StringLength(100)] public string checkout_before { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string HouseRules { get; set; }
        // Health & Safety
        public bool CovidSafety { get; set; } = false;
        public bool SurfacesSanitized { get; set; } = false;
        public bool CarbonMonoxideAlarm { get; set; } = false;
        public bool SmokeAlarm { get; set; } = false;
        public bool SecurityDepositRequired { get; set; } = false;
        public decimal SecurityDepositAmount { get; set; } = 0;
        public CancellationPolicy CancellationPolicy { get; set; }
        public ICollection<PropertyAmenity> PropertyAmenities { get; set; }
        public ICollection<Calendar> Calendars { get; set; }
        public ICollection<Booking> Bookings { get; set; }
        public ICollection<PropertyPhoto> Photos { get; set; }
        public ICollection<SavedListings> SavedListings { get; set; }
        public ICollection<Review> Reviews { get; set; }

    }
}
