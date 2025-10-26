using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using UITour.Models;
using UITour.DAL.Interfaces;
using UITour.ServicesL.Interfaces;

namespace UITour.ServicesL.Implementations
{
    public class BookingService : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork;

        public BookingService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<Booking> CreateAsync(Booking booking)
        {
            if (!await IsPropertyAvailableAsync(booking.PropertyID, booking.CheckIn, booking.CheckOut))
                throw new InvalidOperationException("Property is not available for selected dates");

            booking.TotalPrice = await CalculateTotalPriceAsync(booking.PropertyID, booking.CheckIn, booking.CheckOut);
            await _unitOfWork.Bookings.AddAsync(booking);
            await _unitOfWork.SaveChangesAsync();
            return booking;
        }

        public async Task<Booking> GetByIdAsync(int id)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
            if (booking == null)
                throw new InvalidOperationException("Booking not found");

            return booking;
        }

        public async Task<IEnumerable<Booking>> GetByUserIdAsync(int userId)
        {
            return await _unitOfWork.Bookings.Query().Where(b => b.UserID == userId).ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetByHostIdAsync(int hostId)
        {
            return await _unitOfWork.Bookings.Query().Where(b => b.HostID == hostId).ToListAsync();
        }

        public async Task<bool> CancelBookingAsync(int bookingId)
        {
            var booking = await GetByIdAsync(bookingId);
            if (booking == null) return false;

            booking.Status = "Cancelled";
            _unitOfWork.Bookings.Update(booking);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsPropertyAvailableAsync(int propertyId, DateTime checkIn, DateTime checkOut)
        {
            var existingBookings = await _unitOfWork.Bookings.Query().Where(b => b.PropertyID == propertyId && b.Status != "Cancelled").ToListAsync();
            return !existingBookings.Any(b => (checkIn >= b.CheckIn && checkIn <= b.CheckOut) || (checkOut >= b.CheckIn && checkOut <= b.CheckOut));
        }

        public async Task<decimal> CalculateTotalPriceAsync(int propertyId, DateTime checkIn, DateTime checkOut)
        {
            var property = await _unitOfWork.Properties.GetByIdAsync(propertyId);
            if (property == null)
                throw new InvalidOperationException("Property not found");

            var numberOfNights = (checkOut - checkIn).Days;
            var basePrice = property.Price * numberOfNights;
            var cleaningFee = property.CleaningFee ?? 0;
            var serviceFee = basePrice * 0.1m; // 10% service fee

            return basePrice + cleaningFee + serviceFee;
        }

        public async Task<IEnumerable<DateTime>> GetBlockedDatesAsync(int propertyId)
        {
            var bookings = await _unitOfWork.Bookings.Query().Where(b => b.PropertyID == propertyId && b.Status != "Cancelled").ToListAsync();
            var blockedDates = new List<DateTime>();

            foreach (var booking in bookings)
            {
                for (var date = booking.CheckIn; date <= booking.CheckOut; date = date.AddDays(1))
                {
                    blockedDates.Add(date);
                }
            }

            return blockedDates;
        }

        public async Task<bool> UpdateBookingStatusAsync(int bookingId, string status)
        {
            var booking = await GetByIdAsync(bookingId);
            if (booking == null) return false;

            booking.Status = status;
            _unitOfWork.Bookings.Update(booking);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}