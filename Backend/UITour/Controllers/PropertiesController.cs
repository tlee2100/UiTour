using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Security.Claims;
using UITour.Models;
using UITour.Models.DTO;
using UITour.ServicesL.Interfaces;

namespace UITour.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyService _propertyService;

        public PropertiesController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        // GET: api/properties
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var allProperties = await _propertyService.GetAllAsync();
            // Only return active properties for public access
            var activeProperties = allProperties.Where(p => p.Active == true).ToList();
            return Ok(activeProperties);
        }

        // GET: api/properties/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var property = await _propertyService.GetByIdAsync(id);
            if (property == null) return NotFound();
            return Ok(property);
        }

        // POST: api/properties
        [HttpPost]
        public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyDto dto)
        {
            // Debug: Log DTO received
            System.Diagnostics.Debug.WriteLine($"🔍 CreateProperty - DTO received: CleaningFee={dto?.CleaningFee}, ServiceFee={dto?.ServiceFee}, TaxFee={dto?.TaxFee}, ExtraPeopleFee={dto?.ExtraPeopleFee}");
            
            if (!ModelState.IsValid)
            {
                System.Diagnostics.Debug.WriteLine($"❌ ModelState invalid: {string.Join(", ", ModelState.SelectMany(x => x.Value.Errors.Select(e => $"{x.Key}: {e.ErrorMessage}")))}");
                return BadRequest(ModelState);
            }

            try
            {
                Property property = await _propertyService.CreateAsync(dto);
                
                // Debug: Log property created
                System.Diagnostics.Debug.WriteLine($"✅ Property created: ID={property.PropertyID}, CleaningFee={property.CleaningFee}, ServiceFee={property.ServiceFee}, TaxFee={property.TaxFee}");

                // Trả về dữ liệu gọn nhẹ sau khi tạo
                return Ok(new
                {
                    property.PropertyID,
                    property.ListingTitle,
                    property.Location,
                    property.Price,
                    property.Currency,
                    Photos = property.Photos?.Select(p => new
                    {
                        p.PhotoID,
                        p.Url,
                        p.Caption,
                        p.SortIndex
                    }),
                     Amenities = property.PropertyAmenities?.Select(pa => new {
                         pa.AmenityID,
                         pa.Amenity?.AmenityName
                     })
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/properties/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Property property)
        {
            if (id != property.PropertyID)
                return BadRequest("ID in URL does not match ID in body");

            var updated = await _propertyService.UpdateAsync(property);
            return Ok(updated);
        }

        // DELETE: api/properties/5 (Admin or Owner only)
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Get current user ID and role from JWT
                // JWT uses ClaimTypes.NameIdentifier for UserID and ClaimTypes.Role for role
                var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var userRole = User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { error = "User ID not found in token" });
                }

                // Get property to check ownership
                var property = await _propertyService.GetByIdAsync(id);
                if (property == null)
                    return NotFound(new { error = $"Property with ID {id} not found" });

                // Check if user is Admin or Owner
                bool isAdmin = userRole?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true;
                bool isOwner = property.Host?.UserID == userId;

                if (!isAdmin && !isOwner)
                {
                    return StatusCode(403, new { error = "You do not have permission to delete this property. Only the owner or an admin can delete it." });
                }

                // Proceed with deletion
                var success = await _propertyService.DeleteAsync(id);
                if (!success) return NotFound(new { error = $"Property with ID {id} not found" });
                return Ok(new { message = "Property deleted successfully", propertyId = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/properties/host/3
        [HttpGet("host/{hostId:int}")]
        public async Task<IActionResult> GetByHost(int hostId)
        {
            var result = await _propertyService.GetByHostIdAsync(hostId);
            return Ok(result);
        }

        // GET: api/properties/user/3
        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var result = await _propertyService.GetByUserIdAsync(userId);
            return Ok(result);
        }

        // GET: api/properties/search?location=HCM&checkIn=2025-10-15&checkOut=2025-10-18&guests=2
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? location, [FromQuery] DateTime? checkIn, [FromQuery] DateTime? checkOut, [FromQuery] int? guests)
        {
            var result = await _propertyService.SearchAsync(location, checkIn, checkOut, guests);
            return Ok(result);
        }

        // POST: api/properties/5/amenities/2
        [HttpPost("{propertyId:int}/amenities/{amenityId:int}")]
        public async Task<IActionResult> AddAmenity(int propertyId, int amenityId)
        {
            var success = await _propertyService.AddAmenityAsync(propertyId, amenityId);
            return success ? Ok("Amenity added") : BadRequest("Failed to add amenity");
        }

        // DELETE: api/properties/5/amenities/2
        [HttpDelete("{propertyId:int}/amenities/{amenityId:int}")]
        public async Task<IActionResult> RemoveAmenity(int propertyId, int amenityId)
        {
            var success = await _propertyService.RemoveAmenityAsync(propertyId, amenityId);
            return success ? Ok("Amenity removed") : NotFound("Amenity not found");
        }

        // GET: api/properties/5/amenities
        [HttpGet("{propertyId}/amenities")]
        public async Task<IActionResult> GetPropertyAmenities(int propertyId)
        {
            var amenities = await _propertyService.GetAmenitiesByPropertyIdAsync(propertyId);

            if (!amenities.Any())
                return NotFound($"No amenities found for property ID {propertyId}");

            return Ok(amenities);
        }

        //GET: api/properties/5/roomtype
        [HttpGet("{id:int}/roomtype")]
        public async Task<IActionResult> GetRoomTypeByPropertyId(int id)
        {
            var roomType = await _propertyService.GetRoomTypeByPropertyIdAsync(id);
            if (roomType == null)
                return NotFound($"No RoomType found for Property ID {id}");

            return Ok(roomType);
        }

        //GET: api/properties/5/bedtype
        [HttpGet("{id:int}/bedtype")]
        public async Task<IActionResult> GetBedTypeByPropertyId(int id)
        {
            var bedType = await _propertyService.GetBedTypeByPropertyIdAsync(id);
            if (bedType == null)
                return NotFound($"No BedType found for Property ID {id}");
            return Ok(bedType);
        }

        //GET: api/properties/5/photo
        [HttpGet("{id:int}/photo")]
        public async Task<IActionResult> GetPropertyPhotoByPropertyId(int id)
        {
            var photo = await _propertyService.GetPropertyPhotoByPropertyIdAsync(id);
            if (photo == null)
                return NotFound($"No Photo found for Property ID {id}");
            return Ok(photo);
        }

        // PUT: api/properties/5/approve (Admin only)
        [HttpPut("{id:int}/approve")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ApproveProperty(int id)
        {
            try
            {
                var property = await _propertyService.GetByIdAsync(id);
                if (property == null)
                    return NotFound($"Property with ID {id} not found");

                property.Active = true;
                property.UpdatedAt = DateTime.Now;
                await _propertyService.UpdateAsync(property);

                return Ok(new { message = "Property approved successfully", propertyId = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/properties/5/reject (Admin only)
        [HttpPut("{id:int}/reject")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> RejectProperty(int id, [FromBody] RejectRequestDto request)
        {
            try
            {
                var property = await _propertyService.GetByIdAsync(id);
                if (property == null)
                    return NotFound($"Property with ID {id} not found");

                property.Active = false;
                property.UpdatedAt = DateTime.Now;
                await _propertyService.UpdateAsync(property);

                return Ok(new { message = "Property rejected", propertyId = id, reason = request?.Reason });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/properties/pending (Admin only)
        [HttpGet("pending")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetPendingProperties()
        {
            try
            {
                var allProperties = await _propertyService.GetAllAsync();
                // Filter: Active == false or Active == null (not explicitly set to true)
                var pendingProperties = allProperties.Where(p => p.Active == false || p.Active == null).ToList();
                return Ok(pendingProperties);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
