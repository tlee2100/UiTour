using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UITour.Models;
using UITour.Models.DTO;
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
            var allTours = await _tourService.GetAllAsync();
            // Only return active tours for public access
            var activeTours = allTours.Where(t => t.Active == true).ToList();
            return Ok(activeTours);
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
        public async Task<ActionResult<Tour>> CreateTour([FromBody] CreateTourDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdTour = await _tourService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetTourById), new { id = createdTour.TourID }, createdTour);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
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

        // DELETE: api/tour/{id} (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            var deleted = await _tourService.DeleteAsync(id);
            if (!deleted)
                return NotFound(new { error = $"Tour with ID {id} not found" });

            return Ok(new { message = "Tour deleted successfully", tourId = id });
        }

        // ==================== FILTERS ====================

        [HttpGet("host/{hostId}")]
        public async Task<ActionResult<IEnumerable<Tour>>> GetToursByHost(int hostId)
        {
            var tours = await _tourService.GetByHostIdAsync(hostId);
            return Ok(tours);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Tour>>> GetToursByUser(int userId)
        {
            var tours = await _tourService.GetByUserIdAsync(userId);
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
        
        [HttpGet("{tourId}/experiencedetails")]
        public async Task<ActionResult<IEnumerable<ExperienceDetails>>> GetExperienceDetails(int tourId)
        {
            var details = await _tourService.GetExperienceDetailAsync(tourId);
            return Ok(details);
        }

        // PUT: api/tour/5/approve (Admin only)
        [HttpPut("{id}/approve")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ApproveTour(int id)
        {
            try
            {
                var tour = await _tourService.GetByIdAsync(id);
                if (tour == null)
                    return NotFound($"Tour with ID {id} not found");

                tour.Active = true;
                await _tourService.UpdateAsync(tour);

                return Ok(new { message = "Tour approved successfully", tourId = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/tour/5/reject (Admin only)
        [HttpPut("{id}/reject")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> RejectTour(int id, [FromBody] RejectRequestDto request)
        {
            try
            {
                Tour tour;
                try
                {
                    tour = await _tourService.GetByIdAsync(id);
                }
                catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
                {
                    return NotFound(new { error = $"Tour with ID {id} not found" });
                }

                if (tour == null)
                    return NotFound(new { error = $"Tour with ID {id} not found" });

                tour.Active = false;
                var updateResult = await _tourService.UpdateAsync(tour);
                
                if (!updateResult)
                    return BadRequest(new { error = "Failed to update tour status" });

                return Ok(new { message = "Tour rejected successfully", tourId = id, reason = request?.Reason });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"An error occurred while rejecting tour: {ex.Message}" });
            }
        }

        // GET: api/tour/pending (Admin only)
        [HttpGet("pending")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetPendingTours()
        {
            try
            {
                var allTours = await _tourService.GetAllAsync();
                // Filter: Active == false or Active == null (not explicitly set to true)
                var pendingTours = allTours.Where(t => t.Active == false || t.Active == null).ToList();
                return Ok(pendingTours);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
