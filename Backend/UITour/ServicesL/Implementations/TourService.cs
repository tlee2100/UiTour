using System.Collections.Generic;
using System.Threading.Tasks;
using UITour.Models;
using UITour.DAL.Interfaces;
using UITour.ServicesL.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;

namespace UITour.ServicesL.Implementations
{
    public class TourService : ITourService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TourService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
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
                .FirstOrDefaultAsync(t => t.TourID == id);
            if (tour == null)
                throw new InvalidOperationException("Tour not found");
            return tour;

        }

        public async Task<Tour> CreateAsync(Tour tour)
        {
            await _unitOfWork.Tours.AddAsync(tour); 
            await _unitOfWork.SaveChangesAsync(); 
            return tour;

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
    }
}
