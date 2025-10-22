using Microsoft.AspNetCore.Mvc;
using UITour.Models;
using UITour.ServicesL.Interfaces;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // POST: api/booking
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingCreateRequest request)
        {
            try
            {
                var booking = new Booking
                {
                    PropertyID = request.PropertyID,
                    GuestID = request.GuestID,
                    HostID = request.HostID,
                    CheckIn = request.CheckIn,
                    CheckOut = request.CheckOut,
                    GuestsCount = request.GuestCounts,
                    Status = "Pending"
                };

                var createdBooking = await _bookingService.CreateAsync(booking);
                return CreatedAtAction(nameof(GetById), new { id = createdBooking.BookingID }, createdBooking);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/booking/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var booking = await _bookingService.GetByIdAsync(id);
                return Ok(booking);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/booking/user/5
        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            try
            {
                var bookings = await _bookingService.GetByUserIdAsync(userId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/booking/host/5
        [HttpGet("host/{hostId:int}")]
        public async Task<IActionResult> GetByHostId(int hostId)
        {
            try
            {
                var bookings = await _bookingService.GetByHostIdAsync(hostId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/booking/5/cancel
        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            try
            {
                var result = await _bookingService.CancelBookingAsync(id);
                return result ? Ok(new { message = "Booking cancelled successfully" }) : BadRequest("Failed to cancel booking");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/booking/property/5/availability
        [HttpGet("property/{propertyId:int}/availability")]
        public async Task<IActionResult> CheckPropertyAvailability(int propertyId, [FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
        {
            try
            {
                var isAvailable = await _bookingService.IsPropertyAvailableAsync(propertyId, checkIn, checkOut);
                return Ok(new { 
                    propertyId, 
                    checkIn, 
                    checkOut, 
                    isAvailable 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/booking/property/5/price
        [HttpGet("property/{propertyId:int}/price")]
        public async Task<IActionResult> CalculatePrice(int propertyId, [FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
        {
            try
            {
                var totalPrice = await _bookingService.CalculateTotalPriceAsync(propertyId, checkIn, checkOut);
                return Ok(new { 
                    propertyId, 
                    checkIn, 
                    checkOut, 
                    totalPrice 
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/booking/5/status
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] BookingStatusUpdateRequest request)
        {
            try
            {
                var result = await _bookingService.UpdateBookingStatusAsync(id, request.Status);
                return result ? Ok(new { message = "Booking status updated successfully" }) : BadRequest("Failed to update booking status");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/booking/property/5/blocked-dates
        [HttpGet("property/{propertyId:int}/blocked-dates")]
        public async Task<IActionResult> GetBlockedDates(int propertyId)
        {
            try
            {
                var blockedDates = await _bookingService.GetBlockedDatesAsync(propertyId);
                return Ok(new { 
                    propertyId, 
                    blockedDates 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    // DTOs for request/response
    public class BookingCreateRequest
    {
        public int PropertyID { get; set; }
        public int GuestID { get; set; }
        public int HostID { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public short GuestCounts { get; set; }
    }

    public class BookingStatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
