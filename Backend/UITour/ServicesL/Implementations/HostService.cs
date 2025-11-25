using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using UITour.Models;
using UITour.DAL.Interfaces;
using UITour.ServicesL.Interfaces;

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
                .Include(b => b.Property)
                    .ThenInclude(p => p.Photos)
                .Include(b => b.Property)
                    .ThenInclude(p => p.Reviews)
                .Include(b => b.Tour)
                    .ThenInclude(t => t.Photos)
                .Include(b => b.Tour)
                    .ThenInclude(t => t.Reviews)
                .Include(b => b.User)
                .Include(b => b.Host)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tour>> GetToursAsync(int hostId)
        {
            return await _unitOfWork.Tours.Query()
                .Where(p => p.HostID == hostId)
                .ToListAsync();
        }

    }
}