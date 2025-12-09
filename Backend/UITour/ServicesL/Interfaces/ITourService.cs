using System.Collections.Generic;
using System.Threading.Tasks;
using UITour.Models;
using UITour.Models.DTO;

namespace UITour.ServicesL.Interfaces
{
    public interface ITourService
    {
        // ======== TOUR CRUD ========
        Task<IEnumerable<Tour>> GetAllAsync();
        Task<Tour> GetByIdAsync(int id);
        Task<Tour> CreateAsync(Tour tour);
        Task<Tour> CreateAsync(CreateTourDto dto);
        Task<bool> UpdateAsync(Tour tour);
        Task<bool> UpdateTourAsync(int id,UpdateTourDto tour);
        Task<bool> DeleteAsync(int id);

        // ======== FILTERING & RELATIONSHIP ========
        Task<IEnumerable<Tour>> GetByHostIdAsync(int hostId);
        Task<IEnumerable<Tour>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Tour>> GetByCityIdAsync(int cityId);
        Task<IEnumerable<Tour>> GetByCountryIdAsync(int countryId);

        // ======== PARTICIPANTS ========
        Task<IEnumerable<Booking>> GetParticipantsAsync(int tourId);

        // ======== REVIEWS ========
        Task<IEnumerable<TourReview>> GetReviewsAsync(int tourId);
        Task<TourReview> AddReviewAsync(TourReview review);
        Task<bool> DeleteReviewAsync(int reviewId);

        // ======== PHOTOS ========
        Task<IEnumerable<TourPhoto>> GetPhotosAsync(int tourId);
        Task<TourPhoto> AddPhotoAsync(TourPhoto photo);
        Task<bool> DeletePhotoAsync(int photoId);
        Task<IEnumerable<ExperienceDetails>> GetExperienceDetailAsync(int tourId);
        Task ReplacePhotosAsync(int tourId, List<TourPhotoDto> photosDto);
        Task ReplaceExperienceDetailsAsync(int tourId, List<ExperienceDetailDto> detailsDto);
    }
}
