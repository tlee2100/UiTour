using Microsoft.AspNetCore.Mvc;
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
            var properties = await _propertyService.GetAllAsync();
            return Ok(properties);
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
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                Property property = await _propertyService.CreateAsync(dto);

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

        // DELETE: api/properties/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _propertyService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        // GET: api/properties/host/3
        [HttpGet("host/{hostId:int}")]
        public async Task<IActionResult> GetByHost(int hostId)
        {
            var result = await _propertyService.GetByHostIdAsync(hostId);
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
    }
}
