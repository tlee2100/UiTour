using System.Threading.Tasks;
using System.Collections.Generic;
using UITour.Models;
using UITour.Models.DTO;
public interface IPropertyService
{
  Task<IEnumerable<Property>> GetAllAsync();
  Task<Property> GetByIdAsync(int id);
  Task<Property> CreateAsync(CreatePropertyDto dto);
  Task<Property> UpdateAsync(Property property);
  Task<bool> DeleteAsync(int id);
  Task<IEnumerable<Property>> GetByHostIdAsync(int hostId);
  Task<IEnumerable<Property>> SearchAsync(string location, DateTime? checkIn, DateTime? checkOut, int? guests);
  Task<bool> AddAmenityAsync(int propertyId, int amenityId);
  Task<bool> RemoveAmenityAsync(int propertyId, int amenityId);
  Task<IEnumerable<Amenity>> GetAmenitiesByPropertyIdAsync(int propertyId);
  Task<RoomType> GetRoomTypeByPropertyIdAsync(int propertyId);
  Task<BedType> GetBedTypeByPropertyIdAsync(int propertyId);
  Task<PropertyPhoto> GetPropertyPhotoByPropertyIdAsync(int propertyId);
}