using Microsoft.AspNetCore.Mvc;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PingController : ControllerBase
    {
        /*private readonly IPropertyService _propertyService;
        public PingController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
        }*/
        [HttpGet]
        public IActionResult Get() => Ok(new { message = "pong" });
        //[HttpGet("properties")]
        //public async Task<IActionResult> GetProps() => Ok(await _propertyService.GetAllAsync());
    }
}


