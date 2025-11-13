using System.Collections.Generic;
using System.Threading.Tasks;
using UITour.Models;

namespace UITour.ServicesL.Interfaces
{
    public interface ITourService
    {
        // ======== TOUR CRUD ========
        Task<IEnumerable<Tour>> GetAllAsync();
        Task<Tour> GetByIdAsync(int id);
        Task<Tour> CreateAsync(Tour tour);
        Task<bool> UpdateAsync(Tour tour);
        Task<bool> DeleteAsync(int id);

        // ======== FILTERING & RELATIONSHIP ========
        Task<IEnumerable<Tour>> GetByHostIdAsync(int hostId);
        Task<IEnumerable<Tour>> GetByCityIdAsync(int cityId);
        Task<IEnumerable<Tour>> GetByCountryIdAsync(int countryId);

        // ======== PARTICIPANTS ========
        Task<IEnumerable<TourParticipant>> GetParticipantsAsync(int tourId);
        Task<bool> AddParticipantAsync(int tourId, int userId);
        Task<bool> RemoveParticipantAsync(int tourId, int userId); 

        // ======== REVIEWS ========
        Task<IEnumerable<TourReview>> GetReviewsAsync(int tourId);
        Task<TourReview> AddReviewAsync(TourReview review);
        Task<bool> DeleteReviewAsync(int reviewId);

        // ======== PHOTOS ========
        Task<IEnumerable<TourPhoto>> GetPhotosAsync(int tourId);
        Task<TourPhoto> AddPhotoAsync(TourPhoto photo);
        Task<bool> DeletePhotoAsync(int photoId);
        Task<IEnumerable<ExperienceDetails>> GetExperienceDetailAsync(int tourId);
    }
}
