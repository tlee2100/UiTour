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
            // Validate that either PropertyID or TourID is set
            if (!booking.PropertyID.HasValue && !booking.TourID.HasValue)
                throw new InvalidOperationException("Either PropertyID or TourID must be provided");

            if (booking.PropertyID.HasValue && booking.TourID.HasValue)
                throw new InvalidOperationException("Cannot specify both PropertyID and TourID");

            // Check availability and calculate price based on type
            if (booking.PropertyID.HasValue)
            {
                // Property booking
                if (!await IsPropertyAvailableAsync(booking.PropertyID.Value, booking.CheckIn, booking.CheckOut))
                    throw new InvalidOperationException("Property is not available for selected dates");

                booking.TotalPrice = await CalculatePropertyTotalPriceAsync(booking.PropertyID.Value, booking.CheckIn, booking.CheckOut);
            }
            else if (booking.TourID.HasValue)
            {
                // Tour booking - use the provided TotalPrice or calculate from tour price
                if (booking.TotalPrice == 0)
                {
                    booking.TotalPrice = await CalculateTourTotalPriceAsync(booking.TourID.Value, booking.GuestsCount);
                }
            }

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
            var existingBookings = await _unitOfWork.Bookings.Query()
                .Where(b => b.PropertyID == propertyId && b.Status != "Cancelled")
                .ToListAsync();
            return !existingBookings.Any(b => 
                (checkIn >= b.CheckIn && checkIn <= b.CheckOut) || 
                (checkOut >= b.CheckIn && checkOut <= b.CheckOut) ||
                (checkIn <= b.CheckIn && checkOut >= b.CheckOut));
        }

        public async Task<decimal> CalculatePropertyTotalPriceAsync(int propertyId, DateTime checkIn, DateTime checkOut)
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

        public async Task<decimal> CalculateTourTotalPriceAsync(int tourId, short guestsCount)
        {
            var tour = await _unitOfWork.Tours.GetByIdAsync(tourId);
            if (tour == null)
                throw new InvalidOperationException("Tour not found");

            // Tour price is per person
            return tour.Price * guestsCount;
        }

        // Keep the old method for backward compatibility, but it only works for properties
        public async Task<decimal> CalculateTotalPriceAsync(int propertyId, DateTime checkIn, DateTime checkOut)
        {
            return await CalculatePropertyTotalPriceAsync(propertyId, checkIn, checkOut);
        }

        public async Task<IEnumerable<DateTime>> GetBlockedDatesAsync(int propertyId)
        {
            var bookings = await _unitOfWork.Bookings.Query()
                .Where(b => b.PropertyID == propertyId && b.Status != "Cancelled")
                .ToListAsync();
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

        public async Task<Transaction> ConfirmTransferAsync(int bookingId)
        {
            var booking = await GetByIdAsync(bookingId);
            if (booking == null)
                throw new InvalidOperationException("Booking not found");

            // Update booking status to "Pending Approval"
            booking.Status = "Pending Approval";
            _unitOfWork.Bookings.Update(booking);

            // Create a transaction with status "awaiting_approval"
            var transaction = new Transaction
            {
                BookingID = bookingId,
                Amount = booking.TotalPrice,
                Currency = booking.Currency ?? "USD",
                PaymentMethod = "Bank Transfer",
                PaymentStatus = "awaiting_approval",
                ProcessedAt = DateTime.Now
            };

            await _unitOfWork.Transactions.AddAsync(transaction);
            await _unitOfWork.SaveChangesAsync();

            return transaction;
        }
    }
}