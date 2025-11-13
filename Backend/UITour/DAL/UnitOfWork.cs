using Microsoft.EntityFrameworkCore;
using UITour.DAL.Interfaces;
using UITour.DAL.Interfaces.Repositories;
using UITour.DAL.Repositories;
using UITour.Models;

namespace UITour.DAL
{
    //tao db context 1 lan duy nhat
    public class UnitOfWork : IUnitOfWork
    {
        private readonly UITourContext _context;

        public UnitOfWork(UITourContext context)
        {
            _context = context;
            Countries = new CountryRepository(_context);
            Cities = new CityRepository(_context);
            Neighbourhoods = new NeighbourhoodRepository(_context);
            RoomTypes = new RoomTypeRepository(_context);
            BedTypes = new BedTypeRepository(_context);
            CancellationPolicies = new CancellationPolicyRepository(_context);
            VerificationTypes = new VerificationTypeRepository(_context);
            Amenities = new AmenityRepository(_context);
            Users = new UserRepository(_context);
            Hosts = new HostRepository(_context);
            Properties = new PropertyRepository(_context);
            PropertyAmenities = new PropertyAmenityRepository(_context);
            PropertyPhotos = new PropertyPhotoRepository(_context);
            Calendars = new CalendarRepository(_context);
            Bookings = new BookingRepository(_context);
            Transactions = new TransactionRepository(_context);
            Reviews = new ReviewRepository(_context);
            HostVerifications = new HostVerificationRepository(_context);
            SavedListings = new SavedListingRepository(_context);
            Messages = new MessageRepository(_context);
            Tours = new TourRepository(_context);
            TourParticipants = new TourParticipantRepository(_context);
            TourPhotos = new TourPhotoRepository(_context);
            TourReviews = new TourReviewRepository(_context);
            ExperienceDetails = new ExperienceDetailsRepository(_context);
        }

        public ICountryRepository Countries { get; }
        public ICityRepository Cities { get; }
        public INeighbourhoodRepository Neighbourhoods { get; }
        public IRoomTypeRepository RoomTypes { get; }
        public IBedTypeRepository BedTypes { get; }
        public ICancellationPolicyRepository CancellationPolicies { get; }
        public IVerificationTypeRepository VerificationTypes { get; }
        public IAmenityRepository Amenities { get; }
        public IUserRepository Users { get; }
        public IHostRepository Hosts { get; }
        public IPropertyRepository Properties { get; }
        public IPropertyAmenityRepository PropertyAmenities { get; }
        public IPropertyPhotoRepository PropertyPhotos { get; }
        public ICalendarRepository Calendars { get; }
        public IBookingRepository Bookings { get; }
        public ITransactionRepository Transactions { get; }
        public IReviewRepository Reviews { get; }
        public IHostVerificationRepository HostVerifications { get; }
        public ISavedListingRepository SavedListings { get; }
        public IMessageRepository Messages { get; }

        public ITourReviewRepository TourReviews { get; }
        public ITourParticipantRepository TourParticipants { get; }
        public ITourPhotoRepository TourPhotos { get; }
        public ITourRepository Tours { get; }
        public IExperienceDetailsRepository ExperienceDetails { get; }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async ValueTask DisposeAsync()
        {
            await _context.DisposeAsync();
        }
    }
}


