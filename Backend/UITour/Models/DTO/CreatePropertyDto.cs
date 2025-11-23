namespace UITour.Models.DTO
{
    public class CreatePropertyDto
    {
        public int UserID { get; set; } // UserID - sẽ tự động tạo Host nếu chưa có
        public string ListingTitle { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public int? CityID { get; set; }
        public int? CountryID { get; set; }
        public int? RoomTypeID { get; set; }
        public short? Bedrooms { get; set; }
        public short? Beds { get; set; }
        public decimal? Bathrooms { get; set; }
        public short? Accommodates { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public bool Active { get; set; } = true;
        public string PropertyType { get; set; }
        public string lat { get; set; }
        public string lng { get; set; }
        public string HouseRules { get; set; }

        // Fees
        public decimal? CleaningFee { get; set; }
        public decimal? ExtraPeopleFee { get; set; }
        public decimal ServiceFee { get; set; } = 0;
        public decimal TaxFee { get; set; } = 0;


        public List<PropertyAmenityDto> Amenities { get; set; }
        public List<PropertyPhotoDto> Photos { get; set; }
    }

    public class SeasonalDiscountDto
    {
        public string From { get; set; }
        public string To { get; set; }
        public decimal Percentage { get; set; }
    }

    public class EarlyBirdDiscountDto
    {
        public int DaysBefore { get; set; }
        public decimal Percent { get; set; }
    }
    public class PropertyPhotoDto
    {
        public string Url { get; set; }
        public string Caption { get; set; }
        public int SortIndex { get; set; }
    }
    public class PropertyAmenityDto
    {
        public int AmenityID { get; set; }
    }
}

