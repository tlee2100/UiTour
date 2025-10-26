using Microsoft.AspNetCore.Mvc;
using UITour.ServicesL.Interfaces;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CountryController: ControllerBase
    {
        private readonly ICountryService _countryService;
        public CountryController(ICountryService countryService)
        {
            _countryService = countryService;
        }
        // GET: api/country
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var countries = await _countryService.GetAllAynsc();
            return Ok(countries);
        }
        // GET: api/country/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var country = await _countryService.GetByIdAsync(id);
            return Ok(country);
        }
        // POST: api/country
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Models.Country country)
        {
            var createdCountry = await _countryService.CreateAsync(country);
            return CreatedAtAction(nameof(GetById), new { id = createdCountry.CountryID }, createdCountry);
        }
        // PUT: api/country/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Models.Country country)
        {
            if (id != country.CountryID)
            {
                return BadRequest("Country ID mismatch");
            }
            var updatedCountry = await _countryService.UpdateAsync(country);
            return Ok(updatedCountry);
        }
        // DELETE: api/country/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _countryService.DeleteAsync(id);
            return NoContent();
        }
    }
}
