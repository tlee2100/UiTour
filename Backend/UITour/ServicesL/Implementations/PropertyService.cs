using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using UITour.Models;
using UITour.DAL.Interfaces;
using UITour.ServicesL.Interfaces;

namespace UITour.ServicesL.Implementations
{
    public class PropertyService : IPropertyService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PropertyService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<IEnumerable<Property>> GetAllAsync()
        {
            return await _unitOfWork.Properties.Query().ToListAsync();
        }

        public async Task<Property> GetByIdAsync(int id)
        {
            var property = await _unitOfWork.Properties.GetByIdAsync(id);
            if (property == null)
                throw new InvalidOperationException("Property not found");

            return property;
        }

        public async Task<Property> CreateAsync(Property property)
        {
            await _unitOfWork.Properties.AddAsync(property);
            await _unitOfWork.SaveChangesAsync();
            return property;
        }

        public async Task<Property> UpdateAsync(Property property)
        {
            var existingProperty = await GetByIdAsync(property.PropertyID);

            existingProperty.Name = property.Name;
            existingProperty.Description = property.Description;
            existingProperty.Price = property.Price;
            existingProperty.HostID = property.HostID;

            _unitOfWork.Properties.Update(existingProperty);
            await _unitOfWork.SaveChangesAsync();
            return existingProperty;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var property = await GetByIdAsync(id);
            if (property == null) return false;

            _unitOfWork.Properties.Remove(property);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Property>> GetByHostIdAsync(int hostId)
        {
            return await _unitOfWork.Properties.Query().Where(p => p.HostID == hostId).ToListAsync();
        }

        public async Task<IEnumerable<Property>> SearchAsync(string location, DateTime? checkIn, DateTime? checkOut, int? guests)
        {
            var query = _unitOfWork.Properties.Query().AsQueryable();

            if (!string.IsNullOrEmpty(location))
                query = query.Where(p => p.Location.Contains(location));

            if (checkIn.HasValue && checkOut.HasValue)
                query = query.Where(p => !p.Bookings.Any(b => b.CheckIn < checkOut && b.CheckOut > checkIn));

            if (guests.HasValue)
                query = query.Where(p => p.MaxGuests >= guests);

            return await query.ToListAsync();
        }

        public async Task<bool> AddAmenityAsync(int propertyId, int amenityId)
        {
            var propertyAmenity = new PropertyAmenity { PropertyID = propertyId, AmenityID = amenityId };
            await _unitOfWork.PropertyAmenities.AddAsync(propertyAmenity);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveAmenityAsync(int propertyId, int amenityId)
        {
            var propertyAmenity = await _unitOfWork.PropertyAmenities.Query().FirstOrDefaultAsync(pa => pa.PropertyID == propertyId && pa.AmenityID == amenityId);
            if (propertyAmenity == null) return false;

            _unitOfWork.PropertyAmenities.Remove(propertyAmenity);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}