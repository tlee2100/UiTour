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
            var host = await _unitOfWork.Hosts.Query().Include(h => h.Properties).FirstOrDefaultAsync(h => h.HostID == id);
            if (host == null)
                throw new InvalidOperationException("Host not found");

            return host;
        }

        public async Task<HostModel> RegisterHostAsync(HostModel host)
        {
            var existingHost = await _unitOfWork.Hosts.Query().FirstOrDefaultAsync(h => h.UserID == host.UserID);
            if (existingHost != null)
                throw new InvalidOperationException("User is already registered as a host");

            await _unitOfWork.Hosts.AddAsync(host);
            await _unitOfWork.SaveChangesAsync();
            return host;
        }

        public async Task<bool> UpdateHostProfileAsync(HostModel host)
        {
            var existingHost = await GetByIdAsync(host.HostID);

            existingHost.AboutMe = host.AboutMe;
            existingHost.Location = host.Location;
            existingHost.ResponseTime = host.ResponseTime;
            existingHost.AcceptanceRate = host.AcceptanceRate;

            _unitOfWork.Hosts.Update(existingHost);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerifyHostAsync(int hostId)
        {
            var host = await GetByIdAsync(hostId);

            host.IsVerified = true;
            host.VerificationDate = DateTime.UtcNow;

            _unitOfWork.Hosts.Update(host);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<HostVerification>> GetVerificationsAsync(int hostId)
        {
            return await _unitOfWork.HostVerifications.Query().Where(hv => hv.HostID == hostId).ToListAsync();
        }

        public async Task<decimal> GetEarningsAsync(int hostId, DateTime startDate, DateTime endDate)
        {
            var bookings = await _unitOfWork.Bookings.Query().Where(b => b.HostID == hostId && b.Status == "Completed" && b.CheckOut >= startDate && b.CheckIn <= endDate).ToListAsync();
            return bookings.Sum(b => b.TotalPrice);
        }

        public async Task<IEnumerable<Review>> GetHostReviewsAsync(int hostId)
        {
            return await _unitOfWork.Reviews.Query().Where(r => r.PropertyID == hostId).ToListAsync();
        }

        public async Task<double> GetAverageRatingAsync(int hostId)
        {
            var reviews = await GetHostReviewsAsync(hostId);
            return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
        }
    }
}