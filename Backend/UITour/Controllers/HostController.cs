using Microsoft.AspNetCore.Mvc;
using UITour.Models;
using UITour.ServicesL.Interfaces;

using HostModel = UITour.Models.Host; // Alias to resolve ambiguity

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HostController : ControllerBase
    {
        private readonly IHostService _hostService;

        public HostController(IHostService hostService)
        {
            _hostService = hostService;
        }

        // GET: api/host/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var host = await _hostService.GetByIdAsync(id);
                return Ok(host);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/host/register
        [HttpPost("register")]
        public async Task<IActionResult> RegisterHost([FromBody] HostRegistrationRequest request)
        {
            try
            {
                var host = new HostModel
                {
                    UserID = request.UserID,
                    HostAbout = request.HostAbout,
                    HostResponseRate = request.HostResponseRate,
                    IsSuperHost = request.IsSuperHost,
                    //IsVerified = false
                };

                var registeredHost = await _hostService.RegisterHostAsync(host);
                return CreatedAtAction(nameof(GetById), new { id = registeredHost.HostID }, registeredHost);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/host/{id}/profile
        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateHostProfile(int id, [FromBody] HostModel host)
        {
            try
            {
                host.HostID = id;
                var result = await _hostService.UpdateHostProfileAsync(host);
                return result ? Ok(new { message = "Host profile updated successfully" }) : BadRequest("Failed to update host profile");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // PUT: api/host/{id}/verify
        [HttpPut("{id}/verify")]
        public async Task<IActionResult> VerifyHost(int id)
        {
            try
            {
                var result = await _hostService.VerifyHostAsync(id);
                return result ? Ok(new { message = "Host verified successfully" }) : BadRequest("Failed to verify host");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/host/{id}/verifications
        [HttpGet("{id}/verifications")]
        public async Task<IActionResult> GetVerifications(int id)
        {
            try
            {
                var verifications = await _hostService.GetVerificationsAsync(id);
                return Ok(verifications);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/host/{id}/earnings
        [HttpGet("{id}/earnings")]
        public async Task<IActionResult> GetEarnings(int id, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
                var end = endDate ?? DateTime.UtcNow;

                var earnings = await _hostService.GetEarningsAsync(id, start, end);
                return Ok(new
                {
                    hostId = id,
                    startDate = start,
                    endDate = end,
                    totalEarnings = earnings
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/host/{id}/reviews
        //[HttpGet("{id}/reviews")]
        /*public async Task<IActionResult> GetHostReviews(int id)
        {
            try
            {
                var reviews = await _hostService.GetHostReviewsAsync(id);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }*/

        // GET: api/host/{id}/verification-status
        [HttpGet("{id}/verification-status")]
        public async Task<IActionResult> GetVerificationStatus(int id)
        {
            try
            {
                var isVerified = await _hostService.IsHostVerifiedAsync(id);
                return Ok(new
                {
                    hostId = id,
                    isVerified
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/host/{id}/verify-with-type
        [HttpPut("{id}/verify-with-type")]
        public async Task<IActionResult> VerifyHostWithType(int id, [FromBody] HostVerificationRequest request)
        {
            try
            {
                var result = await _hostService.VerifyHostWithTypeAsync(id, request.VerificationTypeId, request.Details);
                return result ? Ok(new { message = "Host verified successfully with specific type" }) : BadRequest("Failed to verify host");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/host/{id}/properties
        [HttpGet("{id}/properties")]
        public async Task<IActionResult> GetProperties(int id)
        {
            try
            {
                var properties = await _hostService.GetPropertiesAsync(id);
                return Ok(properties);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/host/{id}/bookings
        [HttpGet("{id}/bookings")]
        public async Task<IActionResult> GetBookings(int id)
        {
            try
            {
                var bookings = await _hostService.GetBookingsAsync(id);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        // GET: api/host/{id}/tours
        [HttpGet("{id}/tours")]
        public async Task<IActionResult> GetTours(int id)
        {
            try
            {
                var tours = await _hostService.GetToursAsync(id);
                return Ok(tours);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    // DTOs for request/response
    public class HostRegistrationRequest
    {
        public int UserID { get; set; }
        public string HostAbout { get; set; } = string.Empty;
        public byte? HostResponseRate { get; set; }
        public bool IsSuperHost { get; set; }
    }
   

    public class HostVerificationRequest
    {
        public int VerificationTypeId { get; set; }
        public string? Details { get; set; }
    }
}
