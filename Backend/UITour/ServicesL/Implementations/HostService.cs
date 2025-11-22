using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using UITour.Models;
using UITour.DAL.Interfaces;
using UITour.ServicesL.Interfaces;
using UITour.Models.DTO;

using HostModel = UITour.Models.Host; // Alias to resolve ambiguity

namespace UITour.ServicesL.Implementations
{
    public class HostService : IHostService
    {
        private readonly IUnitOfWork _unitOfWork;

        public HostService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<HostModel> GetByIdAsync(int id)
        {
            var host = await _unitOfWork.Hosts.Query()
                .Include(h => h.User)
                .Include(h => h.Properties)
                .Include(h => h.Verifications)
                .FirstOrDefaultAsync(h => h.HostID == id);

            if (host == null)
                throw new InvalidOperationException("Host not found");

            return host;
        }

        public async Task<HostModel> GetByUserIdAsync(int userId)
        {
            var host = await _unitOfWork.Hosts.Query()
                .Include(h => h.User)
                .Include(h => h.Properties)
                .Include(h => h.Verifications)
                .FirstOrDefaultAsync(h => h.UserID == userId);

            // Nếu chưa có Host, tự động tạo mới
            if (host == null)
            {
                // Kiểm tra User có tồn tại không
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                    throw new InvalidOperationException("User not found");

                // Tạo Host mới
                host = new HostModel
                {
                    UserID = userId,
                    HostSince = DateTime.UtcNow,
                    IsSuperHost = false,
                    HostAbout = null,
                    HostResponseRate = null
                };

                await _unitOfWork.Hosts.AddAsync(host);
                await _unitOfWork.SaveChangesAsync();

                // Load lại với includes
                host = await _unitOfWork.Hosts.Query()
                    .Include(h => h.User)
                    .Include(h => h.Properties)
                    .Include(h => h.Verifications)
                    .FirstOrDefaultAsync(h => h.HostID == host.HostID);
            }

            return host;
        }

        public async Task<HostModel> RegisterHostAsync(HostModel host)
        {
            // Check if user exists
            var user = await _unitOfWork.Users.GetByIdAsync(host.UserID);
            if (user == null)
                throw new InvalidOperationException("User not found");

            // Check if user is already a host
            var existingHost = await _unitOfWork.Hosts.Query().FirstOrDefaultAsync(h => h.UserID == host.UserID);
            if (existingHost != null)
                throw new InvalidOperationException("User is already registered as a host");

            // Set default values
            host.HostSince = DateTime.UtcNow;
            host.IsSuperHost = false;

            await _unitOfWork.Hosts.AddAsync(host);
            await _unitOfWork.SaveChangesAsync();
            return host;
        }

        public async Task<bool> UpdateHostProfileAsync(HostModel host)
        {
            var existingHost = await GetByIdAsync(host.HostID);

            // Update only original model properties
            existingHost.HostAbout = host.HostAbout;
            existingHost.HostResponseRate = host.HostResponseRate;
            existingHost.IsSuperHost = host.IsSuperHost;

            _unitOfWork.Hosts.Update(existingHost);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerifyHostAsync(int hostId)
        {
            var host = await GetByIdAsync(hostId);

            // Create a new HostVerification record
            var hostVerification = new HostVerification
            {
                HostID = hostId,
                VerificationTypeID = 1, // Assuming 1 is the ID for basic verification
                VerifiedAt = DateTime.UtcNow,
                Details = "Host verification completed"
            };

            await _unitOfWork.HostVerifications.AddAsync(hostVerification);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<HostVerification>> GetVerificationsAsync(int hostId)
        {
            return await _unitOfWork.HostVerifications.Query()
                .Where(hv => hv.HostID == hostId)
                .ToListAsync();
        }

        public async Task<decimal> GetEarningsAsync(int hostId, DateTime startDate, DateTime endDate)
        {
            var bookings = await _unitOfWork.Bookings.Query()
                .Where(b => b.HostID == hostId &&
                           b.Status == "Completed" &&
                           b.CheckOut >= startDate &&
                           b.CheckIn <= endDate)
                .ToListAsync();

            return bookings.Sum(b => b.TotalPrice);
        }

        /*public async Task<IEnumerable<Review>> GetHostReviewsAsync(int hostId)
        {
            // Get all properties owned by the host
            var propertyIds = await _unitOfWork.Properties
                .Query()
                .Where(p => p.HostID == hostId)
                .Select(p => p.PropertyID)
                .ToListAsync();

            if (propertyIds.Count == 0)
                return new List<Review>();

            // Get reviews for all properties owned by the host
            return await _unitOfWork.Reviews
                .Query()
                .Where(r => propertyIds.Contains(r.PropertyID))
                .ToListAsync();
        }*/

        public async Task<bool> IsHostVerifiedAsync(int hostId)
        {
            var verifications = await _unitOfWork.HostVerifications.Query()
                .Where(hv => hv.HostID == hostId)
                .ToListAsync();
            
            return verifications.Any();
        }

        public async Task<bool> VerifyHostWithTypeAsync(int hostId, int verificationTypeId, string details = null)
        {
            var host = await GetByIdAsync(hostId);

            // Create a new HostVerification record with specific verification type
            var hostVerification = new HostVerification
            {
                HostID = hostId,
                VerificationTypeID = verificationTypeId,
                VerifiedAt = DateTime.UtcNow,
                Details = details ?? "Host verification completed"
            };

            await _unitOfWork.HostVerifications.AddAsync(hostVerification);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Property>> GetPropertiesAsync(int hostId)
        {
            return await _unitOfWork.Properties.Query()
                .Where(p => p.HostID == hostId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsAsync(int hostId)
        {
            return await _unitOfWork.Bookings.Query()
                .Where(p => p.HostID == hostId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tour>> GetToursAsync(int hostId)
        {
            return await _unitOfWork.Tours.Query()
                .Where(p => p.HostID == hostId)
                .ToListAsync();
        }

        public async Task<IEnumerable<HostListingDto>> GetListingsAsync(int hostId)
        {
            var listings = new List<HostListingDto>();

            // Get Properties with Photos and Reviews
            var properties = await _unitOfWork.Properties.Query()
                .Where(p => p.HostID == hostId)
                .Include(p => p.Photos)
                .Include(p => p.Reviews)
                .ToListAsync();

            foreach (var property in properties)
            {
                var avgRating = property.Reviews != null && property.Reviews.Any()
                    ? property.Reviews.Average(r => (double)r.Rating)
                    : 0.0;

                var firstPhoto = property.Photos?.OrderBy(p => p.SortIndex).FirstOrDefault();

                listings.Add(new HostListingDto
                {
                    Id = property.PropertyID,
                    Title = property.ListingTitle ?? "Untitled Property",
                    ImageUrl = firstPhoto?.Url,
                    Rating = Math.Round(avgRating, 2),
                    Status = property.Active ? "Listed" : "Unlisted",
                    Type = "Property",
                    CreatedAt = property.CreatedAt
                });
            }

            // Get Tours with Photos and Reviews
            var tours = await _unitOfWork.Tours.Query()
                .Where(t => t.HostID == hostId)
                .Include(t => t.Photos)
                .Include(t => t.Reviews)
                .ToListAsync();

            foreach (var tour in tours)
            {
                var avgRating = tour.Reviews != null && tour.Reviews.Any()
                    ? tour.Reviews.Average(r => (double)r.Rating)
                    : 0.0;

                var firstPhoto = tour.Photos?.OrderBy(p => p.SortIndex).FirstOrDefault();

                listings.Add(new HostListingDto
                {
                    Id = tour.TourID,
                    Title = tour.TourName ?? "Untitled Tour",
                    ImageUrl = firstPhoto?.Url,
                    Rating = Math.Round(avgRating, 2),
                    Status = tour.Active ? "Listed" : "Unlisted",
                    Type = "Tour",
                    CreatedAt = tour.CreatedAt
                });
            }

            // Sort by CreatedAt descending (newest first)
            return listings.OrderByDescending(l => l.CreatedAt);
        }

    }
}