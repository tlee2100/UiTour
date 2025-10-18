using Microsoft.AspNetCore.Mvc;
using UITour.Models;
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
        public async Task<IActionResult> Create([FromBody] Property property)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _propertyService.CreateAsync(property);
            return CreatedAtAction(nameof(GetById), new { id = created.PropertyID }, created);
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
    }
}
