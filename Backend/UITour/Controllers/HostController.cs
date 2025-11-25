using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UITour.Models;
using UITour.ServicesL.Interfaces;
using UITour.DAL.Interfaces;

using HostModel = UITour.Models.Host; // Alias to resolve ambiguity

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HostController : ControllerBase
    {
        private readonly IHostService _hostService;
        private readonly IUnitOfWork _unitOfWork;

        public HostController(IHostService hostService, IUnitOfWork unitOfWork)
        {
            _hostService = hostService;
            _unitOfWork = unitOfWork;
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
                System.Diagnostics.Debug.WriteLine($"Loaded {bookings.Count()} bookings for host {id}");
                
                // Check what's loaded
                foreach (var b in bookings)
                {
                    System.Diagnostics.Debug.WriteLine($"Booking {b.BookingID}: PropertyID={b.PropertyID}, Property loaded={b.Property != null}, TourID={b.TourID}, Tour loaded={b.Tour != null}, UserID={b.UserID}, User loaded={b.User != null}");
                }
                
                // Load all transactions for these bookings at once
                var bookingIds = bookings.Select(b => b.BookingID).ToList();
                var transactions = await _unitOfWork.Transactions.Query()
                    .Where(t => bookingIds.Contains(t.BookingID))
                    .ToListAsync();
                var transactionDict = transactions.ToDictionary(t => t.BookingID);
                
                // Load all Properties and Tours that are referenced but not loaded
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
                
                // Load all Users that are referenced but not loaded
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
                    
                    // Get Property - always use dict (more reliable than navigation property)
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
                    else
                    {
                        System.Diagnostics.Debug.WriteLine($"Booking {b.BookingID} has no PropertyID");
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
                        
                        System.Diagnostics.Debug.WriteLine($"Built property object with {photos.Count} photos and {reviews.Count} reviews");
                    }
                    
                    // Get Tour - always use dict (more reliable than navigation property)
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
                    else
                    {
                        System.Diagnostics.Debug.WriteLine($"Booking {b.BookingID} has no TourID");
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
                        
                        System.Diagnostics.Debug.WriteLine($"Built tour object with {photos.Count} photos and {reviews.Count} reviews");
                    }
                    
                    // Get User - always use dict (more reliable than navigation property)
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
                    else
                    {
                        System.Diagnostics.Debug.WriteLine($"Booking {b.BookingID} has invalid UserID: {b.UserID}");
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
                        System.Diagnostics.Debug.WriteLine($"Built user object: {user.FullName}");
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine($"User object is NULL for booking {b.BookingID}");
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
                    
                    System.Diagnostics.Debug.WriteLine($"Final booking object - Property: {(propertyObj != null ? "EXISTS" : "NULL")}, Tour: {(tourObj != null ? "EXISTS" : "NULL")}, User: {(userObj != null ? "EXISTS" : "NULL")}");
                    
                    bookingsWithTransactions.Add(bookingObj);
                }
                
                return Ok(bookingsWithTransactions);
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
