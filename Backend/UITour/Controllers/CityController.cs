using Microsoft.AspNetCore.Mvc;
using UITour.Models;
using UITour.ServicesL.Interfaces;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CityController: ControllerBase
    {
        private readonly ICityService _cityService;
        public CityController(ICityService cityService)
        {
            _cityService = cityService;
        }
        // GET: api/city
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cities = await _cityService.GetAllAsync();
            return Ok(cities);
        }
        // GET: api/city/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var city = await _cityService.GetByIdAsync(id);
                return Ok(city);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }
        // POST: api/city
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Models.City city)
        {
            var createdCity = await _cityService.CreateAsync(city);
            return CreatedAtAction(nameof(GetById), new { id = createdCity.CityID }, createdCity);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] City city)
        {
            if (id != city.CityID)
                return BadRequest();

            var result = await _cityService.UpdateAsync(city);
            if (result == null)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _cityService.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("country/{countryId:int}")]
        public async Task<IActionResult> GetByCountryId(int countryId)
        {
            var cities = await _cityService.GetCitiesByCountryIdAsync(countryId);
            if (cities == null || !cities.Any())
                return NotFound($"No cities found for country with ID {countryId}");

            return Ok(cities);
        }
    }
}
