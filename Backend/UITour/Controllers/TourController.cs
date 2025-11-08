using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using UITour.Models;
using UITour.ServicesL.Interfaces;

namespace UITour.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TourController : ControllerBase
    {
        private readonly ITourService _tourService;

        public TourController(ITourService tourService)
        {
            _tourService = tourService;
        }

        // ==================== TOUR CRUD ====================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tour>>> GetAllTours()
        {
            var tours = await _tourService.GetAllAsync();
            return Ok(tours);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Tour>> GetTourById(int id)
        {
            var tour = await _tourService.GetByIdAsync(id);
            if (tour == null)
                return NotFound($"Tour with ID {id} not found.");
            return Ok(tour);
        }

        [HttpPost]
        public async Task<ActionResult<Tour>> CreateTour([FromBody] Tour tour)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var createdTour = await _tourService.CreateAsync(tour);
            return CreatedAtAction(nameof(GetTourById), new { id = createdTour.TourID }, createdTour);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTour(int id, [FromBody] Tour tour)
        {
            if (id != tour.TourID)
                return BadRequest("Tour ID mismatch.");

            var updated = await _tourService.UpdateAsync(tour);
            if (!updated)
                return NotFound($"Tour with ID {id} not found.");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            var deleted = await _tourService.DeleteAsync(id);
            if (!deleted)
                return NotFound($"Tour with ID {id} not found.");

            return NoContent();
        }

        // ==================== FILTERS ====================

        [HttpGet("host/{hostId}")]
        public async Task<ActionResult<IEnumerable<Tour>>> GetToursByHost(int hostId)
        {
            var tours = await _tourService.GetByHostIdAsync(hostId);
            return Ok(tours);
        }

        [HttpGet("city/{cityId}")]
        public async Task<ActionResult<IEnumerable<Tour>>> GetToursByCity(int cityId)
        {
            var tours = await _tourService.GetByCityIdAsync(cityId);
            return Ok(tours);
        }

        [HttpGet("country/{countryId}")]
        public async Task<ActionResult<IEnumerable<Tour>>> GetToursByCountry(int countryId)
        {
            var tours = await _tourService.GetByCountryIdAsync(countryId);
            return Ok(tours);
        }

        // ==================== PARTICIPANTS ====================

        [HttpGet("{tourId}/participants")]
        public async Task<ActionResult<IEnumerable<TourParticipant>>> GetParticipants(int tourId)
        {
            var participants = await _tourService.GetParticipantsAsync(tourId);
            return Ok(participants);
        }

        [HttpPost("{tourId}/participants/{userId}")]
        public async Task<IActionResult> AddParticipant(int tourId, int userId)
        {
            var added = await _tourService.AddParticipantAsync(tourId, userId);
            if (!added)
                return Conflict("Participant already joined this tour.");

            return Ok("Participant added successfully.");
        }

        [HttpDelete("{tourId}/participants/{userId}")]
        public async Task<IActionResult> RemoveParticipant(int tourId, int userId)
        {
            var removed = await _tourService.RemoveParticipantAsync(tourId, userId);
            if (!removed)
                return NotFound("Participant not found.");

            return Ok("Participant removed successfully.");
        }

        // ==================== REVIEWS ====================

        [HttpGet("{tourId}/reviews")]
        public async Task<ActionResult<IEnumerable<TourReview>>> GetReviews(int tourId)
        {
            var reviews = await _tourService.GetReviewsAsync(tourId);
            return Ok(reviews);
        }

        [HttpPost("{tourId}/reviews")]
        public async Task<ActionResult<TourReview>> AddReview(int tourId, [FromBody] TourReview review)
        {
            if (review.TourID != tourId)
                return BadRequest("TourID mismatch.");

            var created = await _tourService.AddReviewAsync(review);
            return CreatedAtAction(nameof(GetReviews), new { tourId = review.TourID }, created);
        }

        [HttpDelete("reviews/{reviewId}")]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            var deleted = await _tourService.DeleteReviewAsync(reviewId);
            if (!deleted)
                return NotFound("Review not found.");

            return Ok("Review deleted successfully.");
        }

        // ==================== PHOTOS ====================

        [HttpGet("{tourId}/photos")]
        public async Task<ActionResult<IEnumerable<TourPhoto>>> GetPhotos(int tourId)
        {
            var photos = await _tourService.GetPhotosAsync(tourId);
            return Ok(photos);
        }

        [HttpPost("{tourId}/photos")]
        public async Task<ActionResult<TourPhoto>> AddPhoto(int tourId, [FromBody] TourPhoto photo)
        {
            if (photo.TourID != tourId)
                return BadRequest("TourID mismatch.");

            var created = await _tourService.AddPhotoAsync(photo);
            return CreatedAtAction(nameof(GetPhotos), new { tourId = created.TourID }, created);
        }

        [HttpDelete("photos/{photoId}")]
        public async Task<IActionResult> DeletePhoto(int photoId)
        {
            var deleted = await _tourService.DeletePhotoAsync(photoId);
            if (!deleted)
                return NotFound("Photo not found.");

            return Ok("Photo deleted successfully.");
        }
    }
}
