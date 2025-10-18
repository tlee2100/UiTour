using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using UITour.Models;

namespace UITour.ServicesL.Interfaces
{
    public interface IBookingService
    {
        Task<Booking> CreateAsync(Booking booking);
        Task<Booking> GetByIdAsync(int id);
        Task<IEnumerable<Booking>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Booking>> GetByHostIdAsync(int hostId);
        Task<bool> CancelBookingAsync(int bookingId);
        Task<bool> IsPropertyAvailableAsync(int propertyId, DateTime checkIn, DateTime checkOut);
        Task<decimal> CalculateTotalPriceAsync(int propertyId, DateTime checkIn, DateTime checkOut);
        Task<bool> UpdateBookingStatusAsync(int bookingId, string status);
        Task<IEnumerable<DateTime>> GetBlockedDatesAsync(int propertyId);
    }
}