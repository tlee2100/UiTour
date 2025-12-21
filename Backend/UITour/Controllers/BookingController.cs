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

                // Resolve HostID server-side to ensure bookings are always tied to the correct owner
                int resolvedHostId = 0;

                if (request.PropertyID.HasValue)
                {
                    var property = await _unitOfWork.Properties.Query()
                        .FirstOrDefaultAsync(p => p.PropertyID == request.PropertyID.Value);

                    if (property == null)
                        return NotFound(new { error = $"Property with ID {request.PropertyID.Value} not found" });

                    resolvedHostId = property.HostID;
                }
                else if (request.TourID.HasValue)
                {
                    var tour = await _unitOfWork.Tours.Query()
                        .FirstOrDefaultAsync(t => t.TourID == request.TourID.Value);

                    if (tour == null)
                        return NotFound(new { error = $"Tour with ID {request.TourID.Value} not found" });

                    resolvedHostId = tour.HostID;
                }

                if (resolvedHostId == 0 && request.HostID.HasValue && request.HostID.Value > 0)
                {
                    resolvedHostId = request.HostID.Value;
                }

                if (resolvedHostId == 0)
                {
                    return BadRequest(new { error = "Unable to determine the host for this booking" });
                }

                var booking = new Booking
                {
                    PropertyID = request.PropertyID,
                    TourID = request.TourID,
                    UserID = request.UserID,
                    HostID = resolvedHostId,
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

                var transactionDict = transactions
                .GroupBy(t => t.BookingID)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(x => x.ProcessedAt).First()
                );

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

        // POST: api/booking/{bookingId}/reviews
        [HttpPost("{bookingId:int}/reviews")]
        public async Task<IActionResult> CreateReviewForBooking(int bookingId, [FromBody] CreateReviewDto request)
        {
            if (request == null)
            {
                return BadRequest(new { error = "Review payload is required" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var booking = await _unitOfWork.Bookings.Query()
                .FirstOrDefaultAsync(b => b.BookingID == bookingId);

            if (booking == null)
            {
                return NotFound(new { error = $"Booking with ID {bookingId} not found" });
            }

            // Validate user owns the booking
            if (request.UserId.HasValue && booking.UserID != request.UserId)
            {
                return StatusCode(403, new { error = "You can only review your own bookings" });
            }

            // No status check - users can review any booking at any time
            var trimmedComment = request.Comments?.Trim() ?? string.Empty;

            if (booking.PropertyID.HasValue)
            {
                var existingReview = await _unitOfWork.Reviews.Query()
                    .AnyAsync(r => r.BookingID == bookingId ||
                        (r.PropertyID == booking.PropertyID && r.UserID == booking.UserID));

                if (existingReview)
                {
                    return Conflict(new { error = "You have already reviewed this stay." });
                }

                var review = new Review
                {
                    PropertyID = booking.PropertyID,
                    BookingID = booking.BookingID,
                    UserID = booking.UserID,
                    Rating = request.Rating,
                    Comments = trimmedComment,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Reviews.AddAsync(review);
                await _unitOfWork.SaveChangesAsync();

                // Reload review with User information for proper display
                var savedReview = await _unitOfWork.Reviews.Query()
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.ReviewID == review.ReviewID);

                return Ok(new
                {
                    message = "Review submitted successfully",
                    reviewType = "property",
                    review = savedReview ?? review
                });
            }

            if (booking.TourID.HasValue)
            {
                var existingTourReview = await _unitOfWork.TourReviews.Query()
                    .AnyAsync(r => r.TourID == booking.TourID && r.UserID == booking.UserID);

                if (existingTourReview)
                {
                    return Conflict(new { error = "You have already reviewed this experience." });
                }

                var review = new TourReview
                {
                    TourID = booking.TourID.Value,
                    UserID = booking.UserID,
                    Rating = request.Rating,
                    Comment = trimmedComment,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.TourReviews.AddAsync(review);
                await _unitOfWork.SaveChangesAsync();

                // Reload review with User information for proper display
                var savedReview = await _unitOfWork.TourReviews.Query()
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.ReviewID == review.ReviewID);

                return Ok(new
                {
                    message = "Review submitted successfully",
                    reviewType = "tour",
                    review = savedReview ?? review
                });
            }

            return BadRequest(new { error = "Booking is not linked to a property or tour" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            try
            {
                // ✅ Bước 1: Lấy thông tin booking
                var booking = await _unitOfWork.Bookings.Query()
                    .FirstOrDefaultAsync(b => b.BookingID == id);

                if (booking == null)
                    return NotFound(new { message = "Booking not found" });

                // ✅ Bước 2: Kiểm tra 48h rule - Tìm transaction gần nhất
                var transaction = await _unitOfWork.Transactions.Query()
                    .Where(t => t.BookingID == id)
                    .OrderByDescending(t => t.ProcessedAt)
                    .FirstOrDefaultAsync();

                // ✅ Bước 3: Nếu có transaction, check thời gian
                if (transaction != null)
                {
                    // ✅ Xử lý cả trường hợp DateTime và DateTime?
                    DateTime processedDate;

                    if (transaction.ProcessedAt is DateTime dt)
                    {
                        processedDate = dt;
                    }
                    else
                    {
                        // Nếu ProcessedAt null thì không check 48h rule
                        goto SkipTimeCheck;
                    }

                    var hoursSincePayment = (DateTime.UtcNow - processedDate).TotalHours;

                    // Nếu chưa đủ 48 giờ
                    if (hoursSincePayment < 48)
                    {
                        var remainingHours = Math.Ceiling(48 - hoursSincePayment);
                        return BadRequest(new
                        {
                            message = $"Cancellation is only allowed 48 hours after payment. Please wait {remainingHours} more hours.",
                            hoursSincePayment = Math.Floor(hoursSincePayment),
                            hoursRemaining = remainingHours
                        });
                    }
                }

            SkipTimeCheck:

                // ✅ Bước 4: Nếu không có transaction HOẶC đã quá 48h, cho phép cancel
                var result = await _bookingService.CancelBookingAsync(id);

                if (!result)
                    return NotFound(new { message = "Booking not found" });

                return Ok(new
                {
                    message = "Booking cancelled successfully"
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Log exception nếu có logging service
                System.Diagnostics.Debug.WriteLine($"Error cancelling booking: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while cancelling the booking" });
            }
        }

        // GET: api/booking/property/5/availability
        [HttpGet("property/{propertyId:int}/availability")]
        public async Task<IActionResult> CheckPropertyAvailability(int propertyId, [FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
        {
            try
            {
                var isAvailable = await _bookingService.IsPropertyAvailableAsync(propertyId, checkIn, checkOut);
                return Ok(new
                {
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
                return Ok(new
                {
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
                return Ok(new
                {
                    propertyId,
                    blockedDates
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/booking/host/5/dashboard
        [HttpGet("host/{hostId:int}/dashboard")]
        public async Task<IActionResult> GetHostDashboard(int hostId, int? year = null)
        {
            try
            {
                var now = DateTime.UtcNow;
                var targetYear = year ?? now.Year;

                var bookingsQuery = _unitOfWork.Bookings.Query()
                    .Where(b => b.HostID == hostId && b.Status == "Confirmed");

                // Lọc theo năm
                bookingsQuery = bookingsQuery.Where(b => b.CheckIn.Year == targetYear);

                var bookings = await bookingsQuery.ToListAsync();

                var dto = new HostDashboardDto();

                foreach (var b in bookings)
                {
                    var monthIndex = b.CheckIn.Month - 1; // 0..11
                    var amount = b.TotalPrice;

                    if (b.PropertyID.HasValue)
                    {
                        dto.YearlyStay[monthIndex] += amount;
                    }
                    else if (b.TourID.HasValue)
                    {
                        dto.YearlyExp[monthIndex] += amount;
                    }
                }

                dto.TotalIncomeYTD = dto.YearlyStay.Sum() + dto.YearlyExp.Sum();

                var thisMonthIndex = now.Month - 1;
                dto.IncomeThisMonth = dto.YearlyStay[thisMonthIndex] + dto.YearlyExp[thisMonthIndex];

                dto.BookingsThisMonth = bookings.Count(b => b.CheckIn.Month == now.Month);

                dto.UpcomingBookings = bookings.Count(b => b.CheckIn >= now);

                // Tạm thời chưa tính % thay đổi → set 0
                dto.TotalIncomeYTDChange = 0;
                dto.IncomeThisMonthChange = 0;
                dto.BookingsThisMonthChange = 0;

                return Ok(new
                {
                    summary = new
                    {
                        totalIncomeYTD = dto.TotalIncomeYTD,
                        totalIncomeYTDChange = dto.TotalIncomeYTDChange,
                        incomeThisMonth = dto.IncomeThisMonth,
                        incomeThisMonthChange = dto.IncomeThisMonthChange,
                        bookingsThisMonth = dto.BookingsThisMonth,
                        bookingsThisMonthChange = dto.BookingsThisMonthChange,
                        upcomingBookings = dto.UpcomingBookings
                    },
                    yearlyStay = dto.YearlyStay,
                    yearlyExp = dto.YearlyExp
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
                return Ok(new
                {
                    message = "Transfer confirmed. Booking is now confirmed.",
                    transactionId = transaction.TransactionID,
                    bookingId = id,
                    status = "Confirmed"
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
