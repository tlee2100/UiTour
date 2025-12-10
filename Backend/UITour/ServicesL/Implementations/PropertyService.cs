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
using Microsoft.AspNetCore.Mvc;

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

            // Debug: Log DTO in service
            System.Diagnostics.Debug.WriteLine($"🔍 PropertyService.CreateAsync - DTO: CleaningFee={dto.CleaningFee}, ServiceFee={dto.ServiceFee}, TaxFee={dto.TaxFee}, ExtraPeopleFee={dto.ExtraPeopleFee}");

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
                    .ToList(),
                // Fees
                CleaningFee = dto.CleaningFee,
                ExtraPeopleFee = dto.ExtraPeopleFee,
                ServiceFee = dto.ServiceFee,
                TaxFee = dto.TaxFee,
                // Discounts - Use DiscountPercentage from DTO
                Discount = 0, // Will be calculated at booking time
                DiscountPercentage = dto.DiscountPercentage
            };

            // Debug: Log fees and discount being saved
            System.Diagnostics.Debug.WriteLine($"🔍 Creating property with fees: CleaningFee={property.CleaningFee}, ServiceFee={property.ServiceFee}, TaxFee={property.TaxFee}, ExtraPeopleFee={property.ExtraPeopleFee}, DiscountPercentage={property.DiscountPercentage}");

            try
            {
                await _unitOfWork.Properties.AddAsync(property);
                await _unitOfWork.SaveChangesAsync();

                // Verify fees were saved
                var savedProperty = await _unitOfWork.Properties.Query()
                    .FirstOrDefaultAsync(p => p.PropertyID == property.PropertyID);
                
                System.Diagnostics.Debug.WriteLine($"✅ Property {property.PropertyID} saved with fees: CleaningFee={savedProperty?.CleaningFee}, ServiceFee={savedProperty?.ServiceFee}, TaxFee={savedProperty?.TaxFee}, ExtraPeopleFee={savedProperty?.ExtraPeopleFee}, DiscountPercentage={savedProperty?.DiscountPercentage}");
                
                if (savedProperty != null)
                {
                    // Check if fees were actually saved
                    if (savedProperty.CleaningFee != property.CleaningFee)
                        System.Diagnostics.Debug.WriteLine($"⚠️ WARNING: CleaningFee mismatch! Expected={property.CleaningFee}, Saved={savedProperty.CleaningFee}");
                    if (savedProperty.ServiceFee != property.ServiceFee)
                        System.Diagnostics.Debug.WriteLine($"⚠️ WARNING: ServiceFee mismatch! Expected={property.ServiceFee}, Saved={savedProperty.ServiceFee}");
                    if (savedProperty.TaxFee != property.TaxFee)
                        System.Diagnostics.Debug.WriteLine($"⚠️ WARNING: TaxFee mismatch! Expected={property.TaxFee}, Saved={savedProperty.TaxFee}");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"❌ Error saving property: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"   Inner exception: {ex.InnerException?.Message}");
                throw;
            }

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

            // Update fees if provided
            if (property.CleaningFee.HasValue)
                existingProperty.CleaningFee = property.CleaningFee;
            if (property.ExtraPeopleFee.HasValue)
                existingProperty.ExtraPeopleFee = property.ExtraPeopleFee;
            if (property.ServiceFee != 0)
                existingProperty.ServiceFee = property.ServiceFee;
            if (property.TaxFee != 0)
                existingProperty.TaxFee = property.TaxFee;
            // Update discount percentage if provided
            if (property.DiscountPercentage != 0)
                existingProperty.DiscountPercentage = property.DiscountPercentage;

            _unitOfWork.Properties.Update(existingProperty);
            await _unitOfWork.SaveChangesAsync();
            return existingProperty;
        }


        public async Task<Property> UpdateAsync(int id, [FromBody] PropertyUpdateDto dto)
        {
            var property = await GetByIdAsync(id);
            if (property == null)
                throw new ArgumentNullException(nameof(dto));

            // ----- Basic fields -----
            property.Description = dto.Description;
            property.ListingTitle = dto.ListingTitle;

            property.Price = dto.BasePrice;
            property.CleaningFee = dto.CleaningFee;
            property.ExtraPeopleFee = dto.ExtraPeopleFee;
            property.Currency = dto.Currency;
            property.Active = dto.Active;
            property.PropertyType = dto.PropertyType;
            property.RoomTypeID = dto.RoomTypeID;
            property.Bedrooms = dto.Bedrooms;
            property.Location = dto.Location;
            property.Beds = dto.Beds;
            property.Bathrooms = dto.Bathrooms;
            property.Accommodates = dto.Accommodates;
            property.lat = dto.lat;
            property.lng = dto.lng;
            property.UpdatedAt = DateTime.Now;

            // ----- Amenities -----
            await ReplaceAmenitiesAsync(id, dto.Amenities);
            // ----- Photos -----
            await ReplacePhotosAsync(id, dto.Photos);
            // ----- House Rules -----
            await ReplaceHouseRulesAsync(id,
                dto.HouseRules != null
                    ? string.Join("\n", dto.HouseRules.Select(r => r.Label))
                    : "");

            _unitOfWork.Properties.Update(property);

            await _unitOfWork.SaveChangesAsync();

            return property;

        }


        public async Task<bool> ReplaceAmenitiesAsync(int propertyId, List<PropertyAmenityDto> newAmenities)
        {
            var property = await _unitOfWork.Properties.Query()
                .Include(p => p.PropertyAmenities)
                .FirstOrDefaultAsync(p => p.PropertyID == propertyId);

            if (property == null)
                throw new InvalidOperationException("Property not found");

            // Xóa tất cả amenities cũ
            _unitOfWork.PropertyAmenities.RemoveRange(property.PropertyAmenities);

            if (newAmenities != null && newAmenities.Any())
            {
                // Loại duplicate và invalid IDs
                var amenityIds = newAmenities
                    .Select(a => a.AmenityID)
                    .Where(id => id > 0)
                    .Distinct()
                    .ToList();

                foreach (var id in amenityIds)
                {
                    await _unitOfWork.PropertyAmenities.AddAsync(new PropertyAmenity
                    {
                        PropertyID = propertyId,
                        AmenityID = id
                    });
                }
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReplacePhotosAsync(int propertyId, List<PropertyPhotoDto> newPhotos)
        {
            var property = await _unitOfWork.Properties.Query()
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.PropertyID == propertyId);

            if (property == null)
                throw new InvalidOperationException("Property not found");

            // Xóa toàn bộ ảnh cũ
            _unitOfWork.PropertyPhotos.RemoveRange(property.Photos);

            if (newPhotos != null && newPhotos.Any())
            {
                var photos = newPhotos
                    .Where(p => !string.IsNullOrEmpty(p.Url))
                    .OrderBy(p => p.SortIndex)
                    .ToList();

                foreach (var p in photos)
                {
                    await _unitOfWork.PropertyPhotos.AddAsync(new PropertyPhoto
                    {
                        PropertyID = propertyId,
                        Url = p.Url,
                        Caption = p.Caption,
                        SortIndex = p.SortIndex
                    });
                }
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReplaceHouseRulesAsync(int propertyId, string newRules)
        {
            var property = await _unitOfWork.Properties.Query()
                .FirstOrDefaultAsync(p => p.PropertyID == propertyId);

            if (property == null)
                throw new InvalidOperationException("Property not found");

            property.HouseRules = newRules ?? "";

            property.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();
            return true;
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
            var query = _unitOfWork.Properties.Query()
                .Include(p => p.Photos) // ✅ Include Photos để frontend có thể hiển thị ảnh
                .Include(p => p.Reviews)
                .Include(p => p.City)
                .Include(p => p.Country)
                .AsQueryable();

            // Only return active properties
            query = query.Where(p => p.Active == true);

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