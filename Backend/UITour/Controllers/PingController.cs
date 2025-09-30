using Microsoft.AspNetCore.Mvc;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PingController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get() => Ok(new { message = "pong" });
    }
}


