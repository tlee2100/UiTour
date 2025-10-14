 using UITour.DAL.Interfaces.Repositories;
 
 namespace UITour.DAL.Interfaces
 {
     public interface IUnitOfWork : IAsyncDisposable
     {
         ICountryRepository Countries { get; }
         ICityRepository Cities { get; }
         INeighbourhoodRepository Neighbourhoods { get; }
         IRoomTypeRepository RoomTypes { get; }
         IBedTypeRepository BedTypes { get; }
         ICancellationPolicyRepository CancellationPolicies { get; }
         IVerificationTypeRepository VerificationTypes { get; }
         IAmenityRepository Amenities { get; }
 
         IUserRepository Users { get; }
         IHostRepository Hosts { get; }
 
         IPropertyRepository Properties { get; }
         IPropertyAmenityRepository PropertyAmenities { get; }
         IPropertyPhotoRepository PropertyPhotos { get; }
 
         ICalendarRepository Calendars { get; }
         IBookingRepository Bookings { get; }
         ITransactionRepository Transactions { get; }
         IReviewRepository Reviews { get; }
         IHostVerificationRepository HostVerifications { get; }
         ISavedListingRepository SavedListings { get; }
         IMessageRepository Messages { get; }
 
         Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
     }
 }
 
