using System.Threading.Tasks;
using System.Collections.Generic;
using UITour.Models;
using UITour.Models.DTO;
using Microsoft.AspNetCore.Mvc;
public interface IPropertyService
{
  Task<IEnumerable<Property>> GetAllAsync();
  Task<Property> GetByIdAsync(int id);
  Task<Property> CreateAsync(CreatePropertyDto dto);
  Task<Property> UpdateAsync(Property property);
  Task<bool> DeleteAsync(int id);
  Task<IEnumerable<Property>> GetByHostIdAsync(int hostId);
  Task<IEnumerable<Property>> GetByUserIdAsync(int userId);
  Task<IEnumerable<Property>> SearchAsync(string location, DateTime? checkIn, DateTime? checkOut, int? guests);
  Task<bool> AddAmenityAsync(int propertyId, int amenityId);
  Task<bool> RemoveAmenityAsync(int propertyId, int amenityId);
  Task<IEnumerable<Amenity>> GetAmenitiesByPropertyIdAsync(int propertyId);
  Task<RoomType> GetRoomTypeByPropertyIdAsync(int propertyId);
  Task<BedType> GetBedTypeByPropertyIdAsync(int propertyId);
  Task<PropertyPhoto> GetPropertyPhotoByPropertyIdAsync(int propertyId);
  Task<Property> UpdateAsync(int id, [FromBody] PropertyUpdateDto dto);
  Task<bool> ReplaceAmenitiesAsync(int propertyId, List<PropertyAmenityDto> newAmenities);
  Task<bool> ReplacePhotosAsync(int propertyId, List<PropertyPhotoDto> newPhotos);
  Task<bool> ReplaceHouseRulesAsync(int propertyId, string newRules);

}