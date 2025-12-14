namespace UITour.Models.DTO
{
    public class PropertyUpdateDto
    {
        public string ListingTitle { get; set; }
        public string Description { get; set; }

        // Location breakdown (React đang gửi location.addressLine, city, country)
        //public string Location { get; set; }
        //public int? CityID { get; set; }
        //public int? CountryID { get; set; }
        
        // Room settings
       // public short? Bedrooms { get; set; }
        //public short? Beds { get; set; }
        //public decimal? Bathrooms { get; set; }
        public short? Accommodates { get; set; }

        // Pricing expanded
        public decimal BasePrice { get; set; }
        public decimal? CleaningFee { get; set; }
        public decimal? ExtraPeopleFee { get; set; }
        //public string Currency { get; set; }

        //public decimal WeekendMultiplier { get; set; } = 1;
        public int ExtraPeopleThreshold { get; set; } = 1;

        // Active
        //public bool Active { get; set; }

        // PropertyType, RoomType
        //public string PropertyType { get; set; }
        //public int? RoomTypeID { get; set; }

        // Location mapping from React maps
        //public string lat { get; set; }
        //public string lng { get; set; }

        // House rules (React gửi List< { label } >)
        public List<HouseRuleDto> HouseRules { get; set; }

        // Photos + Amenities same as create DTO
        public List<PropertyPhotoDto> Photos { get; set; }
        public List<PropertyAmenityDto> Amenities { get; set; }
    }

    public class HouseRuleDto
    {
        public string Label { get; set; }
    }
}
