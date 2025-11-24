using Microsoft.AspNetCore.Mvc;
using UITour.Models;
using UITour.Models.DTO;
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
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto request)
        {
            // Validate that either PropertyID or TourID is provided
            if (!request.PropertyID.HasValue && !request.TourID.HasValue)
            {
                return BadRequest(new { error = "Either PropertyID or TourID must be provided" });
            }

            if (request.PropertyID.HasValue && request.TourID.HasValue)
            {
                return BadRequest(new { error = "Cannot specify both PropertyID and TourID" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var nights = request.Nights > 0
                    ? request.Nights
                    : Math.Max(1, (request.CheckOut - request.CheckIn).Days);

                var booking = new Booking
                {
                    PropertyID = request.PropertyID,
                    TourID = request.TourID,
                    UserID = request.UserID,
                    HostID = request.HostID,
                    CheckIn = request.CheckIn,
                    CheckOut = request.CheckOut,
                    GuestsCount = request.GuestsCount,
                    Nights = nights,
                    BasePrice = request.BasePrice,
                    CleaningFee = request.CleaningFee,
                    ServiceFee = request.ServiceFee,
                    TotalPrice = request.TotalPrice,
                    Currency = request.Currency ?? "USD",
                    Status = "Pending"
                };

                var createdBooking = await _bookingService.CreateAsync(booking);
                return CreatedAtAction(nameof(GetById), new { id = createdBooking.BookingID }, createdBooking);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
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
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] Booking request)
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

        // POST: api/booking/5/confirm-transfer
        [HttpPost("{id:int}/confirm-transfer")]
        public async Task<IActionResult> ConfirmTransfer([FromRoute] int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new { error = "Invalid booking ID" });
                }

                var transaction = await _bookingService.ConfirmTransferAsync(id);
                return Ok(new { 
                    message = "Transfer confirmed. Booking is now pending approval.",
                    transactionId = transaction.TransactionID,
                    bookingId = id,
                    status = "Pending Approval"
                });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }

 
   
}
