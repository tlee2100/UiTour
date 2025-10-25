using Microsoft.AspNetCore.Mvc;
using UITour.Models;
using UITour.ServicesL.Interfaces;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NeighbourhoodController : ControllerBase
    {
        private readonly INeighbourhoodService _neighbourhoodService;
        public NeighbourhoodController(INeighbourhoodService neighbourhoodService)
        {
            _neighbourhoodService = neighbourhoodService ?? throw new ArgumentNullException(nameof(neighbourhoodService));
        }

        // GET: api/neighbourhood
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var neighbourhoods = await _neighbourhoodService.GetAllAsync();
            return Ok(neighbourhoods);
        }
        // GET: api/neighbourhood/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var neighbourhood = await _neighbourhoodService.GetByIdAsync(id);
                return Ok(neighbourhood);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }
        // POST: api/neighbourhood
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Models.Neighbourhood neighbourhood)
        {
            var createdNeighbourhood = await _neighbourhoodService.CreateAsync(neighbourhood);
            return CreatedAtAction(nameof(GetById), new { id = createdNeighbourhood.NeighbourhoodID }, createdNeighbourhood);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Models.Neighbourhood neighbourhood)
        {
            if (id != neighbourhood.NeighbourhoodID)
                return BadRequest();
            try
            {
                var result = await _neighbourhoodService.UpdateAsync(neighbourhood);
                return NoContent();
            }
            catch (InvalidOperationException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _neighbourhoodService.DeleteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }

        
        [HttpGet("city/{cityId:int}")]
        public async Task<IActionResult> GetByCityId(int cityId)
        {
            var neighbourhoods = await _neighbourhoodService.GetNeighbourhoodsByCityIdAsync(cityId);
            if (neighbourhoods == null || !neighbourhoods.Any())
                return NotFound();
            return Ok(neighbourhoods);
        }

    }
}
