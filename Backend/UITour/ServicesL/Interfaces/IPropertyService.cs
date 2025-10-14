using System.Threading.Tasks;
using System.Collections.Generic;
using UITour.Models;
public interface IPropertyService
{
  Task<IEnumerable<Property>> GetAllAsync();
  Task<Property> GetByIdAsync(int id);
  Task<Property> CreateAsync(Property property);
  Task<Property> UpdateAsync(Property property);
  Task<bool> DeleteAsync(int id);
  Task<IEnumerable<Property>> GetByHostIdAsync(int hostId);
  Task<IEnumerable<Property>> SearchAsync(string location, DateTime? checkIn, DateTime? checkOut, int? guests);
  Task<bool> AddAmenityAsync(int propertyId, int amenityId);
  Task<bool> RemoveAmenityAsync(int propertyId, int amenityId);
}