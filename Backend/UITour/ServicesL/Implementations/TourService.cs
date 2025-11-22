using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using UITour.Models;
using UITour.DAL.Interfaces;
using UITour.ServicesL.Interfaces;
using UITour.Models.DTO;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;
using Host = UITour.Models.Host;

namespace UITour.ServicesL.Implementations
{
    public class TourService : ITourService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHostService _hostService;

        public TourService(IUnitOfWork unitOfWork, IHostService hostService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _hostService = hostService ?? throw new ArgumentNullException(nameof(hostService));
        }

        // ==================== TOUR CRUD ====================

        public async Task<IEnumerable<Tour>> GetAllAsync()
        {
            return await _unitOfWork.Tours.Query()
                //.Include(t => t.Host)
                .Include(t => t.Photos)
                .Include(t => t.Reviews)
                .ToListAsync();
        }

        public async Task<Tour> GetByIdAsync(int id)
        {
            var tour = await _unitOfWork.Tours.Query()
                .Include(t => t.Photos)
                .Include(t => t.Participants)
                .Include(t => t.Reviews).ThenInclude(r => r.User)
                .Include(t => t.ExperienceDetails)
                .FirstOrDefaultAsync(t => t.TourID == id);
            if (tour == null)
                throw new InvalidOperationException("Tour not found");
            return tour;

        }

        public async Task<Tour> CreateAsync(Tour tour)
        {
            tour.Active = false; // Set to false (pending) - admin must approve
            await _unitOfWork.Tours.AddAsync(tour);
            await _unitOfWork.SaveChangesAsync();
            return tour;
        }

        public async Task<Tour> CreateAsync(CreateTourDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            // Validate required fields
            if (string.IsNullOrWhiteSpace(dto.TourName))
                throw new ArgumentException("TourName is required");
            if (dto.Price <= 0)
                throw new ArgumentException("Price must be greater than 0");
            if (dto.StartDate == default(DateTime))
                throw new ArgumentException("StartDate is required");

            // Tìm hoặc tạo Host cho UserID
            int hostID = await GetOrCreateHostAsync(dto.UserID);

            // Validate CityID and CountryID exist in database
            // Since Tour model requires int (not nullable), we need valid IDs
            int cityID = dto.CityID ?? 0;
            int countryID = dto.CountryID ?? 0;
            
            // If CityID/CountryID is provided, verify they exist in database
            if (cityID > 0)
            {
                var cityExists = await _unitOfWork.Cities.Query()
                    .AnyAsync(c => c.CityID == cityID);
                if (!cityExists)
                    throw new ArgumentException($"City with ID {cityID} does not exist");
            }
            else
            {
                // If CityID is 0 or null, try to find a default city or set to 1
                // You may need to adjust this based on your database structure
                var defaultCity = await _unitOfWork.Cities.Query().FirstOrDefaultAsync();
                if (defaultCity != null)
                    cityID = defaultCity.CityID;
                // If no cities exist, cityID will remain 0 (may cause FK violation)
            }
            
            if (countryID > 0)
            {
                var countryExists = await _unitOfWork.Countries.Query()
                    .AnyAsync(c => c.CountryID == countryID);
                if (!countryExists)
                    throw new ArgumentException($"Country with ID {countryID} does not exist");
            }
            else
            {
                // If CountryID is 0 or null, try to find a default country or set to 1
                var defaultCountry = await _unitOfWork.Countries.Query().FirstOrDefaultAsync();
                if (defaultCountry != null)
                    countryID = defaultCountry.CountryID;
                // If no countries exist, countryID will remain 0 (may cause FK violation)
            }

            var tour = new Tour
            {
                HostID = hostID,
                TourName = dto.TourName?.Trim() ?? "",
                Description = dto.Description?.Trim() ?? "",
                Location = dto.Location?.Trim() ?? "",
                CityID = cityID, // Keep as int, but ensure it exists in DB or handle gracefully
                CountryID = countryID, // Keep as int, but ensure it exists in DB or handle gracefully
                DurationDays = dto.DurationDays > 0 ? dto.DurationDays : 1,
                MaxGuests = dto.MaxGuests > 0 ? dto.MaxGuests : 10,
                Price = dto.Price,
                Currency = dto.Currency?.Trim() ?? "USD",
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Active = false, // Set to false (pending) - admin must approve
                CancellationID = dto.CancellationID,
                CreatedAt = DateTime.Now,
                Photos = dto.Photos?
                    .Where(p => !string.IsNullOrWhiteSpace(p.Url)) // Only include photos with valid URLs
                    .Select((p, index) => new TourPhoto
                    {
                        Url = p.Url?.Trim() ?? "",
                        Caption = p.Caption?.Trim() ?? "",
                        SortIndex = p.SortIndex > 0 ? p.SortIndex : index + 1
                    })
                    .ToList() ?? new List<TourPhoto>()
            };

            // Log photos being saved
            System.Diagnostics.Debug.WriteLine($"Creating tour with {tour.Photos?.Count ?? 0} photos");
            if (tour.Photos != null && tour.Photos.Count > 0)
            {
                foreach (var photo in tour.Photos)
                {
                    System.Diagnostics.Debug.WriteLine($"  Photo URL: {photo.Url}, Caption: {photo.Caption}, SortIndex: {photo.SortIndex}");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("  WARNING: No photos to save for this tour!");
            }

            try
            {
                await _unitOfWork.Tours.AddAsync(tour);
                await _unitOfWork.SaveChangesAsync();
                
                // Verify photos were saved
                var savedTour = await _unitOfWork.Tours.Query()
                    .Include(t => t.Photos)
                    .FirstOrDefaultAsync(t => t.TourID == tour.TourID);
                
                System.Diagnostics.Debug.WriteLine($"Tour {tour.TourID} saved with {savedTour?.Photos?.Count ?? 0} photos in database");
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
            {
                // Handle database update exceptions (foreign key violations, etc.)
                var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
                throw new InvalidOperationException(
                    $"Database error while creating tour: {innerMessage}. " +
                    $"TourName: '{tour.TourName}', CityID: {cityID}, CountryID: {countryID}, HostID: {hostID}. " +
                    $"Please ensure CityID and CountryID exist in database.",
                    dbEx);
            }
            catch (Exception ex)
            {
                // Log the inner exception for debugging
                throw new InvalidOperationException(
                    $"Failed to create tour: {ex.Message}. " +
                    $"Inner exception: {ex.InnerException?.Message ?? "None"}. " +
                    $"TourName: '{tour.TourName}', CityID: {cityID}, CountryID: {countryID}, HostID: {hostID}.",
                    ex);
            }

            return tour;
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

        public async Task<bool> UpdateAsync(Tour tour)
        {
            var existing = await _unitOfWork.Tours.GetByIdAsync(tour.TourID);
            if (existing == null) return false;

            existing.Location = tour.Location;
            existing.Description = tour.Description;
            existing.Price = tour.Price;
            existing.HostID = tour.HostID;
            existing.TourName = tour.TourName;
            existing.DurationDays = tour.DurationDays;
            existing.MaxGuests = tour.MaxGuests;
            existing.StartDate = tour.StartDate;
            existing.EndDate = tour.EndDate;
            existing.Active = tour.Active; // Update Active status
            // Note: Tour model does not have UpdatedAt field, only CreatedAt

            _unitOfWork.Tours.Update(existing);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var tour = await _unitOfWork.Tours.GetByIdAsync(id);
            if (tour == null) return false;

            _unitOfWork.Tours.Remove(tour);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ==================== FILTERING ====================

        public async Task<IEnumerable<Tour>> GetByHostIdAsync(int hostId)
        {
            return await _unitOfWork.Tours.Query()
                .Where(t => t.HostID == hostId)
                .Include(t => t.City)
                .Include(t => t.Country)
                .Include(t => t.Photos)
                .Include(t => t.Reviews)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tour>> GetByUserIdAsync(int userId)
        {
            // Tìm Host theo UserID, sau đó lấy tours của Host đó
            var host = await _unitOfWork.Hosts.Query()
                .FirstOrDefaultAsync(h => h.UserID == userId);

            if (host == null)
            {
                return new List<Tour>(); // User chưa có Host, không có tours
            }

            return await _unitOfWork.Tours.Query()
                .Where(t => t.HostID == host.HostID)
                .Include(t => t.City)
                .Include(t => t.Country)
                .Include(t => t.Photos)
                .Include(t => t.Reviews)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tour>> GetByCityIdAsync(int cityId)
        {
            return await _unitOfWork.Tours.Query()
                .Where(t => t.CityID == cityId)
                .Include(t => t.Host)
                .Include(t => t.Country)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tour>> GetByCountryIdAsync(int countryId)
        {
            return await _unitOfWork.Tours.Query()
                .Where(t => t.CountryID == countryId)
                .Include(t => t.Host)
                .Include(t => t.City)
                .ToListAsync();
        }

        // ==================== PARTICIPANTS ====================

        public async Task<IEnumerable<TourParticipant>> GetParticipantsAsync(int tourId)
        {
            return await _unitOfWork.TourParticipants.Query()
                .Include(p => p.User)
                .Where(p => p.TourID == tourId)
                .ToListAsync();
        }

        public async Task<bool> AddParticipantAsync(int tourId, int userId)
        {
            var exists = await _unitOfWork.TourParticipants.Query()
                .AnyAsync(p => p.TourID == tourId && p.UserID == userId);

            if (exists) return false;

            var participant = new TourParticipant
            {
                TourID = tourId,
                UserID = userId
            };

            await _unitOfWork.TourParticipants.AddAsync(participant);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveParticipantAsync(int tourId, int userId)
        {
            var participant = await _unitOfWork.TourParticipants.Query()
                .FirstOrDefaultAsync(p => p.TourID == tourId && p.UserID == userId);

            if (participant == null) return false;

            _unitOfWork.TourParticipants.Remove(participant);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ==================== REVIEWS ====================

        public async Task<IEnumerable<TourReview>> GetReviewsAsync(int tourId)
        {
            return await _unitOfWork.TourReviews.Query()
                .Include(r => r.User)
                .Where(r => r.TourID == tourId)
                .ToListAsync();
        }

        public async Task<TourReview> AddReviewAsync(TourReview review)
        {
            await _unitOfWork.TourReviews.AddAsync(review);
            await _unitOfWork.SaveChangesAsync();
            return review;
        }

        public async Task<bool> DeleteReviewAsync(int reviewId)
        {
            var review = await _unitOfWork.TourReviews.GetByIdAsync(reviewId);
            if (review == null) return false;

            _unitOfWork.TourReviews.Remove(review);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // ==================== PHOTOS ====================

        public async Task<IEnumerable<TourPhoto>> GetPhotosAsync(int tourId)
        {
            return await _unitOfWork.TourPhotos.Query()
                .Where(p => p.TourID == tourId)
                .ToListAsync();
        }

        public async Task<TourPhoto> AddPhotoAsync(TourPhoto photo)
        {
            await _unitOfWork.TourPhotos.AddAsync(photo);
            await _unitOfWork.SaveChangesAsync();
            return photo;
        }

        public async Task<bool> DeletePhotoAsync(int photoId)
        {
            var photo = await _unitOfWork.TourPhotos.GetByIdAsync(photoId);
            if (photo == null) return false;

            _unitOfWork.TourPhotos.Remove(photo);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ExperienceDetails>> GetExperienceDetailAsync(int tourId)
        {
            return await _unitOfWork.ExperienceDetails.Query()
                .Where(d => d.TourID == tourId)
                .OrderBy(d => d.SortIndex)
                .ToListAsync();
        }
    }
}
