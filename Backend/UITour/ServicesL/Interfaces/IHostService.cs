using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using UITour.Models;
using UITour.Models.DTO;

namespace UITour.ServicesL.Interfaces
{
    public interface IHostService
    {
        Task<Models.Host> GetByIdAsync(int id);
        Task<Models.Host> GetByUserIdAsync(int userId);
        Task<Models.Host> RegisterHostAsync(Models.Host host);
        Task<bool> UpdateHostProfileAsync(Models.Host host);
        Task<bool> VerifyHostAsync(int hostId);
        Task<bool> VerifyHostWithTypeAsync(int hostId, int verificationTypeId, string details = null);
        Task<bool> IsHostVerifiedAsync(int hostId);
        Task<IEnumerable<HostVerification>> GetVerificationsAsync(int hostId);
        Task<decimal> GetEarningsAsync(int hostId, DateTime startDate, DateTime endDate);
        //Task<IEnumerable<Review>> GetHostReviewsAsync(int hostId);
        //Task<double> GetAverageRatingAsync(int hostId);
        Task <IEnumerable<Property>> GetPropertiesAsync(int hostId);
        Task<IEnumerable<Booking>> GetBookingsAsync(int hostId);
        Task<IEnumerable<Tour>> GetToursAsync(int hostId);
        Task<IEnumerable<HostListingDto>> GetListingsAsync(int hostId);
    }
}