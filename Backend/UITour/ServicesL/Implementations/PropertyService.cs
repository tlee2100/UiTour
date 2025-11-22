using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using UITour.Models;
using UITour.DAL.Interfaces;
using UITour.ServicesL.Interfaces;
using UITour.Models.DTO;
using Host = UITour.Models.Host;

namespace UITour.ServicesL.Implementations
{
    public class PropertyService : IPropertyService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHostService _hostService;

        public PropertyService(IUnitOfWork unitOfWork, IHostService hostService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _hostService = hostService ?? throw new ArgumentNullException(nameof(hostService));
        }

        public async Task<IEnumerable<Property>> GetAllAsync()
        {
            return await _unitOfWork.Properties.Query()
                .Include(p => p.Photos)
                .Include(p => p.Reviews)
                .ToListAsync();
        }

        public async Task<Property> GetByIdAsync(int id)
        {
            var property = await _unitOfWork.Properties.Query()
                .Include(p => p.Photos)
                .Include(p => p.Calendars)
                .Include(p => p.RoomType)
                .Include(p => p.BedType)
                .Include(p => p.City)
                .Include(p => p.Country)
                .Include(p => p.Neighbourhood)
                .Include(p => p.PropertyAmenities).ThenInclude(pa => pa.Amenity)
                .Include(p => p.Bookings)
                .Include(p => p.CancellationPolicy)
                .Include(p => p.Reviews).ThenInclude(r => r.User)
                .Include(p => p.Host).ThenInclude(h => h.User)
                .FirstOrDefaultAsync(p => p.PropertyID == id);
            if (property == null)
                throw new InvalidOperationException("Property not found");

            return property;
        }

        public async Task<Property> CreateAsync(CreatePropertyDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            // Tìm hoặc tạo Host cho UserID
            int hostID = await GetOrCreateHostAsync(dto.UserID);

            var distinctAmenityIds = dto.Amenities?
                .Select(a => a.AmenityID)
                .Where(id => id > 0)
                .Distinct()
                .ToList() ?? new List<int>();
            var property = new Property
            {
                HostID = hostID,
                ListingTitle = dto.ListingTitle,
                Description = dto.Description,
                Location = dto.Location,
                CityID = dto.CityID,
                CountryID = dto.CountryID,
                RoomTypeID = dto.RoomTypeID,
                Bedrooms = dto.Bedrooms,
                Beds = dto.Beds,
                Bathrooms = dto.Bathrooms,
                Accommodates = dto.Accommodates,
                Price = dto.Price,
                Currency = dto.Currency,
                Active = false, // Set to false (pending) - admin must approve
                PropertyType = dto.PropertyType,
                lat = dto.lat,
                lng = dto.lng,
                HouseRules = dto.HouseRules,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                Photos = dto.Photos?.Select(p => new PropertyPhoto
                {
                    Url = p.Url,
                    Caption = p.Caption,
                    SortIndex = p.SortIndex
                }).ToList(),
                PropertyAmenities = distinctAmenityIds
                    .Select(id => new PropertyAmenity { AmenityID = id })
                    .ToList()
                };

            await _unitOfWork.Properties.AddAsync(property);
            await _unitOfWork.SaveChangesAsync();

            return property;
        }

        
        /// Tìm Host theo UserID, nếu chưa có thì tạo mới
  
        private async Task<int> GetOrCreateHostAsync(int userID)
        {
            // Tìm Host theo UserID
            var existingHost = await _unitOfWork.Hosts.Query()
                .FirstOrDefaultAsync(h => h.UserID == userID);

            if (existingHost != null)
            {
                return existingHost.HostID;
            }

            // Nếu chưa có Host, tạo mới
            var newHost = new Host
            {
                UserID = userID,
                HostSince = DateTime.UtcNow,
                IsSuperHost = false,
                HostAbout = null,
                HostResponseRate = null
            };

            await _unitOfWork.Hosts.AddAsync(newHost);
            await _unitOfWork.SaveChangesAsync();

            return newHost.HostID;
        }

        public async Task<Property> UpdateAsync(Property property)
        {
            var existingProperty = await GetByIdAsync(property.PropertyID);

            existingProperty.Location = property.Location;
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
            return await _unitOfWork.Properties.Query()
                .Include(p => p.Photos)
                .Include(p => p.Reviews)
                .Where(p => p.HostID == hostId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Property>> GetByUserIdAsync(int userId)
        {
            // Tìm Host theo UserID, sau đó lấy properties của Host đó
            var host = await _unitOfWork.Hosts.Query()
                .FirstOrDefaultAsync(h => h.UserID == userId);

            if (host == null)
            {
                return new List<Property>(); // User chưa có Host, không có properties
            }

            return await _unitOfWork.Properties.Query()
                .Include(p => p.Photos)
                .Include(p => p.Reviews)
                .Where(p => p.HostID == host.HostID)
                .ToListAsync();
        }

        public async Task<IEnumerable<Property>> SearchAsync(string location, DateTime? checkIn, DateTime? checkOut, int? guests)
        {
            var query = _unitOfWork.Properties.Query().AsQueryable();

            if (!string.IsNullOrEmpty(location))
                query = query.Where(p => p.Location.Contains(location));

            if (checkIn.HasValue && checkOut.HasValue)
                query = query.Where(p => !p.Bookings.Any(b => b.CheckIn < checkOut && b.CheckOut > checkIn));

            if (guests.HasValue)
                query = query.Where(p => p.Accommodates >= guests);

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

        public async Task<IEnumerable<Amenity>> GetAmenitiesByPropertyIdAsync(int propertyId)
        {
            return await _unitOfWork.PropertyAmenities.Query()
                .Where(pa => pa.PropertyID == propertyId)
                .Include(pa => pa.Amenity)              // <-- Join sang bảng Amenity
                .Select(pa => pa.Amenity)               // <-- Lấy thông tin Amenity
                .ToListAsync();
        }

        public async Task<RoomType> GetRoomTypeByPropertyIdAsync(int propertyId)
        {
            var property = await _unitOfWork.Properties.Query()
                .Include(p => p.RoomType)
                .FirstOrDefaultAsync(p => p.PropertyID == propertyId);

            return property?.RoomType;
        }

        public async Task<BedType> GetBedTypeByPropertyIdAsync(int propertyId)
        {
            var property = await _unitOfWork.Properties.Query()
                .Include(p => p.BedType)
                .FirstOrDefaultAsync(p => p.PropertyID == propertyId);
            return property?.BedType;
        }

        public async Task<PropertyPhoto> GetPropertyPhotoByPropertyIdAsync(int propertyId)
        {
            var photo = await _unitOfWork.PropertyPhotos.Query()
                .FirstOrDefaultAsync(pp => pp.PropertyID == propertyId);
            return photo;
        }
    }
}