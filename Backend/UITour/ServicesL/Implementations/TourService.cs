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

            // Tìm hoặc tạo Host cho UserID
            int hostID = await GetOrCreateHostAsync(dto.UserID);

            var tour = new Tour
            {
                HostID = hostID,
                TourName = dto.TourName,
                Description = dto.Description,
                Location = dto.Location,
                CityID = dto.CityID ?? 0,
                CountryID = dto.CountryID ?? 0,
                DurationDays = dto.DurationDays,
                MaxGuests = dto.MaxGuests,
                Price = dto.Price,
                Currency = dto.Currency ?? "USD",
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Active = false, // Set to false (pending) - admin must approve
                CancellationID = dto.CancellationID,
                CreatedAt = DateTime.Now,
                Photos = dto.Photos?.Select(p => new TourPhoto
                {
                    Url = p.Url,
                    Caption = p.Caption,
                    SortIndex = p.SortIndex
                }).ToList() ?? new List<TourPhoto>()
            };

            await _unitOfWork.Tours.AddAsync(tour);
            await _unitOfWork.SaveChangesAsync();

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
