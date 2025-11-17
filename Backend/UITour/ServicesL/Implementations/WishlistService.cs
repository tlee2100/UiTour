using Microsoft.EntityFrameworkCore;
using UITour.DAL.Interfaces;
using UITour.Models;
using UITour.Models.DTO;
using UITour.ServicesL.Interfaces;

namespace UITour.ServicesL.Implementations
{
    public class WishlistService : IWishlistService
    {
        private readonly IUnitOfWork _unitOfWork;

        public WishlistService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<WishlistDto> GetUserWishlistAsync(int userId)
        {
            // First, get the default FavoriteList for the user (or create one if it doesn't exist)
            var favoriteList = await _unitOfWork.FavoriteLists.Query()
                .FirstOrDefaultAsync(fl => fl.UserID == userId && fl.ListID == "default");

            // If no default list exists, try to get the first list for the user
            if (favoriteList == null)
            {
                favoriteList = await _unitOfWork.FavoriteLists.Query()
                    .FirstOrDefaultAsync(fl => fl.UserID == userId);
            }

            // If still no list exists, return empty wishlist
            if (favoriteList == null)
            {
                Console.WriteLine($"No FavoriteList found for user {userId}");
                return new WishlistDto
                {
                    Id = "default",
                    Title = "Danh sách yêu thích",
                    Cover = string.Empty,
                    ItemsCount = 0,
                    Items = new List<WishlistItemDto>()
                };
            }

            Console.WriteLine($"Found FavoriteList: {favoriteList.ListID} for user {userId}");

            // Get all saved listings for this user and list
            var savedListings = await _unitOfWork.SavedListings.Query()
                .Where(sl => sl.UserID == userId && (sl.ListID == favoriteList.ListID || string.IsNullOrEmpty(sl.ListID)))
                .ToListAsync();

            Console.WriteLine($"Found {savedListings.Count} saved listings for user {userId} in list {favoriteList.ListID}");

            // Get properties with their details
            var propertyIds = savedListings.Select(sl => sl.PropertyID).ToList();
            
            if (!propertyIds.Any())
            {
                return new WishlistDto
                {
                    Id = favoriteList.ListID,
                    Title = favoriteList.Title,
                    Cover = favoriteList.CoverImage ?? string.Empty,
                    ItemsCount = 0,
                    Items = new List<WishlistItemDto>()
                };
            }

            Console.WriteLine($"Looking for properties with IDs: {string.Join(", ", propertyIds)}");
            
            var properties = await _unitOfWork.Properties.Query()
                .Where(p => propertyIds.Contains(p.PropertyID))
                .Include(p => p.Photos)
                .Include(p => p.Reviews)
                .ToListAsync();

            Console.WriteLine($"Found {properties.Count} properties");

            // Map to DTO
            var items = properties.Select(p =>
            {
                var firstPhoto = p.Photos?.OrderBy(pp => pp.SortIndex).FirstOrDefault();
                var imageUrl = firstPhoto?.Url ?? string.Empty;

                return new WishlistItemDto
                {
                    Id = p.PropertyID,
                    Title = p.ListingTitle ?? p.Location ?? "Untitled Property",
                    Image = imageUrl,
                    Price = p.Price,
                    Type = "property"
                };
            }).ToList();

            // Use cover image from FavoriteList, or first item's image, or empty
            var cover = !string.IsNullOrEmpty(favoriteList.CoverImage) 
                ? favoriteList.CoverImage 
                : (items.FirstOrDefault()?.Image ?? string.Empty);

            return new WishlistDto
            {
                Id = favoriteList.ListID,
                Title = favoriteList.Title,
                Cover = cover,
                ItemsCount = items.Count,
                Items = items
            };
        }

        public async Task<WishlistDto> AddToWishlistAsync(int userId, int propertyId)
        {
            // Get or create default FavoriteList for the user
            var favoriteList = await _unitOfWork.FavoriteLists.Query()
                .FirstOrDefaultAsync(fl => fl.UserID == userId && fl.ListID == "default");

            if (favoriteList == null)
            {
                // Create default list if it doesn't exist
                favoriteList = new FavoriteList
                {
                    ListID = "default",
                    UserID = userId,
                    Title = "Danh sách yêu thích",
                    CoverImage = string.Empty,
                    ItemsCount = 0
                };
                await _unitOfWork.FavoriteLists.AddAsync(favoriteList);
                await _unitOfWork.SaveChangesAsync();
            }

            // Check if already saved
            var existing = await _unitOfWork.SavedListings.Query()
                .FirstOrDefaultAsync(sl => sl.UserID == userId && sl.PropertyID == propertyId);

            if (existing == null)
            {
                var savedListing = new SavedListings
                {
                    UserID = userId,
                    PropertyID = propertyId,
                    SavedAt = DateTime.Now,
                    ListID = favoriteList.ListID
                };

                await _unitOfWork.SavedListings.AddAsync(savedListing);
                
                // Update ItemsCount in FavoriteList
                favoriteList.ItemsCount = await _unitOfWork.SavedListings.Query()
                    .CountAsync(sl => sl.UserID == userId && (sl.ListID == favoriteList.ListID || string.IsNullOrEmpty(sl.ListID)));
                
                _unitOfWork.FavoriteLists.Update(favoriteList);
                await _unitOfWork.SaveChangesAsync();
            }

            // Return updated wishlist
            return await GetUserWishlistAsync(userId);
        }

        public async Task<WishlistDto> RemoveFromWishlistAsync(int userId, int propertyId)
        {
            var savedListing = await _unitOfWork.SavedListings.Query()
                .FirstOrDefaultAsync(sl => sl.UserID == userId && sl.PropertyID == propertyId);

            if (savedListing != null)
            {
                _unitOfWork.SavedListings.Remove(savedListing);
                await _unitOfWork.SaveChangesAsync();
            }

            // Return updated wishlist
            return await GetUserWishlistAsync(userId);
        }
    }
}

