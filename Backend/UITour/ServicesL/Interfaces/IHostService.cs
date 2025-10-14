using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using UITour.Models;

namespace UITour.ServicesL.Interfaces
{
    public interface IHostService
    {
        Task<Models.Host> GetByIdAsync(int id);
        Task<Models.Host> RegisterHostAsync(Models.Host host);
        Task<bool> UpdateHostProfileAsync(Models.Host host);
        Task<bool> VerifyHostAsync(int hostId);
        Task<IEnumerable<HostVerification>> GetVerificationsAsync(int hostId);
        Task<decimal> GetEarningsAsync(int hostId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<Review>> GetHostReviewsAsync(int hostId);
        Task<double> GetAverageRatingAsync(int hostId);
    }
}