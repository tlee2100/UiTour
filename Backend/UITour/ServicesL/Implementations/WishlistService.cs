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

        private static string BuildDefaultListId(int userId) => $"default_{userId}";

        private async Task<FavoriteList> GetOrCreateDefaultFavoriteListAsync(int userId)
        {
            var preferredId = BuildDefaultListId(userId);

            var favoriteList = await _unitOfWork.FavoriteLists.Query()
                .FirstOrDefaultAsync(fl => fl.UserID == userId && fl.ListID == preferredId);

            if (favoriteList != null)
                return favoriteList;

            // Fallback to any existing list for this user (legacy data may use "default")
            favoriteList = await _unitOfWork.FavoriteLists.Query()
                .FirstOrDefaultAsync(fl => fl.UserID == userId);

            if (favoriteList != null)
                return favoriteList;

            // Create a brand-new list with a user-specific key to avoid PK collisions
            favoriteList = new FavoriteList
            {
                ListID = preferredId,
                UserID = userId,
                Title = "Danh sách yêu thích",
                CoverImage = string.Empty,
                ItemsCount = 0
            };

            await _unitOfWork.FavoriteLists.AddAsync(favoriteList);
            await _unitOfWork.SaveChangesAsync();

            return favoriteList;
        }

        public async Task<WishlistDto> GetUserWishlistAsync(int userId)
        {
            var favoriteList = await GetOrCreateDefaultFavoriteListAsync(userId);

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
            var favoriteList = await GetOrCreateDefaultFavoriteListAsync(userId);

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

