using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UITour.Models;
using UITour.Models.DTO;
using UITour.ServicesL.Interfaces;
using UITour.DAL.Interfaces;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IUnitOfWork _unitOfWork;

        public BookingController(IBookingService bookingService, IUnitOfWork unitOfWork)
        {
            _bookingService = bookingService;
            _unitOfWork = unitOfWork;
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
                System.Diagnostics.Debug.WriteLine($"Loaded {bookings.Count()} bookings for host {hostId}");
                
                // Load all transactions for these bookings at once
                var bookingIds = bookings.Select(b => b.BookingID).ToList();
                var transactions = await _unitOfWork.Transactions.Query()
                    .Where(t => bookingIds.Contains(t.BookingID))
                    .ToListAsync();
                var transactionDict = transactions.ToDictionary(t => t.BookingID);
                
                // Load all Properties and Tours that are referenced
                var allPropertyIds = bookings.Where(b => b.PropertyID.HasValue)
                    .Select(b => b.PropertyID.Value).Distinct().ToList();
                var allProperties = allPropertyIds.Any() 
                    ? await _unitOfWork.Properties.Query()
                        .Include(p => p.Photos)
                        .Include(p => p.Reviews)
                        .Where(p => allPropertyIds.Contains(p.PropertyID))
                        .ToListAsync()
                    : new List<Property>();
                System.Diagnostics.Debug.WriteLine($"Loaded {allProperties.Count} properties for IDs: {string.Join(", ", allPropertyIds)}");
                var propertyDict = allProperties.ToDictionary(p => p.PropertyID);
                
                var allTourIds = bookings.Where(b => b.TourID.HasValue)
                    .Select(b => b.TourID.Value).Distinct().ToList();
                var allTours = allTourIds.Any()
                    ? await _unitOfWork.Tours.Query()
                        .Include(t => t.Photos)
                        .Include(t => t.Reviews)
                        .Where(t => allTourIds.Contains(t.TourID))
                        .ToListAsync()
                    : new List<Tour>();
                System.Diagnostics.Debug.WriteLine($"Loaded {allTours.Count} tours for IDs: {string.Join(", ", allTourIds)}");
                var tourDict = allTours.ToDictionary(t => t.TourID);
                
                // Load all Users that are referenced
                var allUserIds = bookings.Where(b => b.UserID > 0)
                    .Select(b => b.UserID).Distinct().ToList();
                var allUsers = allUserIds.Any()
                    ? await _unitOfWork.Users.Query()
                        .Where(u => allUserIds.Contains(u.UserID))
                        .ToListAsync()
                    : new List<User>();
                System.Diagnostics.Debug.WriteLine($"Loaded {allUsers.Count} users for IDs: {string.Join(", ", allUserIds)}");
                var userDict = allUsers.ToDictionary(u => u.UserID);
                
                // Build response with properly serialized navigation properties
                var bookingsWithTransactions = new List<object>();
                
                foreach (var b in bookings)
                {
                    System.Diagnostics.Debug.WriteLine($"Processing booking {b.BookingID}: PropertyID={b.PropertyID}, TourID={b.TourID}, UserID={b.UserID}");
                    
                    // Get transaction for this booking
                    transactionDict.TryGetValue(b.BookingID, out var transaction);
                    
                    // Get Property
                    Property property = null;
                    if (b.PropertyID.HasValue)
                    {
                        if (propertyDict.TryGetValue(b.PropertyID.Value, out property))
                        {
                            System.Diagnostics.Debug.WriteLine($"✓ Found property {b.PropertyID.Value} (Title: {property?.ListingTitle}) for booking {b.BookingID}");
                        }
                        else
                        {
                            System.Diagnostics.Debug.WriteLine($"✗ Property {b.PropertyID.Value} NOT FOUND in database for booking {b.BookingID}");
                        }
                    }
                    
                    // Build property object if exists
                    object propertyObj = null;
                    if (property != null)
                    {
                        var photos = property.Photos != null ? property.Photos.Select(p => new
                        {
                            p.PhotoID,
                            p.Url,
                            p.Caption,
                            p.SortIndex
                        }).Cast<object>().ToList() : new List<object>();
                        
                        var reviews = property.Reviews != null ? property.Reviews.Select(r => new
                        {
                            r.ReviewID,
                            r.Rating,
                            r.Comments
                        }).Cast<object>().ToList() : new List<object>();
                        
                        propertyObj = new
                        {
                            property.PropertyID,
                            property.ListingTitle,
                            property.Description,
                            property.Location,
                            Photos = photos,
                            Reviews = reviews
                        };
                    }
                    
                    // Get Tour
                    Tour tour = null;
                    if (b.TourID.HasValue)
                    {
                        if (tourDict.TryGetValue(b.TourID.Value, out tour))
                        {
                            System.Diagnostics.Debug.WriteLine($"✓ Found tour {b.TourID.Value} (Name: {tour?.TourName}) for booking {b.BookingID}");
                        }
                        else
                        {
                            System.Diagnostics.Debug.WriteLine($"✗ Tour {b.TourID.Value} NOT FOUND in database for booking {b.BookingID}");
                        }
                    }
                    
                    // Build tour object if exists
                    object tourObj = null;
                    if (tour != null)
                    {
                        var photos = tour.Photos != null ? tour.Photos.Select(p => new
                        {
                            p.PhotoID,
                            p.Url,
                            p.Caption,
                            p.SortIndex
                        }).Cast<object>().ToList() : new List<object>();
                        
                        var reviews = tour.Reviews != null ? tour.Reviews.Select(r => new
                        {
                            r.ReviewID,
                            r.Rating,
                            r.Comment
                        }).Cast<object>().ToList() : new List<object>();
                        
                        tourObj = new
                        {
                            tour.TourID,
                            tour.TourName,
                            tour.Description,
                            tour.Location,
                            Photos = photos,
                            Reviews = reviews
                        };
                    }
                    
                    // Get User
                    User user = null;
                    if (b.UserID > 0)
                    {
                        if (userDict.TryGetValue(b.UserID, out user))
                        {
                            System.Diagnostics.Debug.WriteLine($"✓ Found user {b.UserID} (Name: {user?.FullName}, Email: {user?.Email}) for booking {b.BookingID}");
                        }
                        else
                        {
                            System.Diagnostics.Debug.WriteLine($"✗ User {b.UserID} NOT FOUND in database for booking {b.BookingID}");
                            System.Diagnostics.Debug.WriteLine($"Available user IDs in dict: {string.Join(", ", userDict.Keys)}");
                        }
                    }
                    
                    // Build user object if exists
                    object userObj = null;
                    if (user != null)
                    {
                        userObj = new
                        {
                            user.UserID,
                            user.FullName,
                            user.Email,
                            user.Phone
                        };
                    }
                    
                    var bookingObj = new
                    {
                        b.BookingID,
                        b.PropertyID,
                        b.TourID,
                        b.UserID,
                        b.HostID,
                        b.CheckIn,
                        b.CheckOut,
                        b.Nights,
                        b.GuestsCount,
                        b.BasePrice,
                        b.CleaningFee,
                        b.ServiceFee,
                        b.TotalPrice,
                        b.Currency,
                        b.Status,
                        b.CreatedAt,
                        Property = propertyObj,
                        Tour = tourObj,
                        User = userObj,
                        Transaction = transaction != null ? new
                        {
                            transaction.TransactionID,
                            transaction.BookingID,
                            transaction.Amount,
                            transaction.Currency,
                            transaction.PaymentMethod,
                            transaction.PaymentStatus,
                            transaction.ProcessedAt
                        } : null
                    };
                    
                    bookingsWithTransactions.Add(bookingObj);
                }
                
                return Ok(bookingsWithTransactions);
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
