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

            var savedListings = await _unitOfWork.SavedListings.Query()
                .Where(sl => sl.UserID == userId && (sl.ListID == favoriteList.ListID || string.IsNullOrEmpty(sl.ListID)))
                .OrderByDescending(sl => sl.SavedAt)
                .ToListAsync();

            if (!savedListings.Any())
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

            var propertyIds = savedListings
                .Where(sl => sl.PropertyID.HasValue && sl.ItemType == "property")
                .Select(sl => sl.PropertyID.Value)
                .Distinct()
                .ToList();

            var tourIds = savedListings
                .Where(sl => sl.TourID.HasValue && sl.ItemType == "tour")
                .Select(sl => sl.TourID.Value)
                .Distinct()
                .ToList();

            var properties = propertyIds.Any()
                ? await _unitOfWork.Properties.Query()
                    .Where(p => propertyIds.Contains(p.PropertyID))
                    .Include(p => p.Photos)
                    .ToListAsync()
                : new List<Property>();

            var tours = tourIds.Any()
                ? await _unitOfWork.Tours.Query()
                    .Where(t => tourIds.Contains(t.TourID))
                    .Include(t => t.Photos)
                    .ToListAsync()
                : new List<Tour>();

            var propertyLookup = properties.ToDictionary(p => p.PropertyID);
            var tourLookup = tours.ToDictionary(t => t.TourID);

            var items = new List<WishlistItemDto>();

            foreach (var saved in savedListings)
            {
                if (saved.ItemType == "tour" && saved.TourID.HasValue && tourLookup.TryGetValue(saved.TourID.Value, out var tour))
                {
                    var firstPhoto = tour.Photos?.OrderBy(tp => tp.SortIndex).FirstOrDefault();
                    items.Add(new WishlistItemDto
                    {
                        Id = tour.TourID,
                        Title = tour.TourName ?? "Tour",
                        Image = firstPhoto?.Url ?? string.Empty,
                        Price = tour.Price,
                        Type = "tour"
                    });
                }
                else if (saved.PropertyID.HasValue && propertyLookup.TryGetValue(saved.PropertyID.Value, out var property))
                {
                    var firstPhoto = property.Photos?.OrderBy(pp => pp.SortIndex).FirstOrDefault();
                    items.Add(new WishlistItemDto
                    {
                        Id = property.PropertyID,
                        Title = property.ListingTitle ?? property.Location ?? "Untitled Property",
                        Image = firstPhoto?.Url ?? string.Empty,
                        Price = property.Price,
                        Type = "property"
                    });
                }
            }

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

        public async Task<WishlistDto> AddToWishlistAsync(int userId, int itemId, string itemType)
        {
            var favoriteList = await GetOrCreateDefaultFavoriteListAsync(userId);
            var normalizedType = (itemType ?? "property").ToLowerInvariant();

            var query = _unitOfWork.SavedListings.Query();
            SavedListings existing;

            if (normalizedType == "tour")
            {
                existing = await query.FirstOrDefaultAsync(sl =>
                    sl.UserID == userId && sl.ItemType == "tour" && sl.TourID == itemId);
            }
            else
            {
                existing = await query.FirstOrDefaultAsync(sl =>
                    sl.UserID == userId && sl.ItemType == "property" && sl.PropertyID == itemId);
                normalizedType = "property";
            }

            if (existing == null)
            {
                var savedListing = new SavedListings
                {
                    UserID = userId,
                    PropertyID = normalizedType == "property" ? itemId : null,
                    TourID = normalizedType == "tour" ? itemId : null,
                    ItemType = normalizedType,
                    SavedAt = DateTime.Now,
                    ListID = favoriteList.ListID
                };

                await _unitOfWork.SavedListings.AddAsync(savedListing);

                favoriteList.ItemsCount = await _unitOfWork.SavedListings.Query()
                    .CountAsync(sl => sl.UserID == userId && (sl.ListID == favoriteList.ListID || string.IsNullOrEmpty(sl.ListID)));

                _unitOfWork.FavoriteLists.Update(favoriteList);
                await _unitOfWork.SaveChangesAsync();
            }

            return await GetUserWishlistAsync(userId);
        }

        public async Task<WishlistDto> RemoveFromWishlistAsync(int userId, int itemId, string itemType)
        {
            var normalizedType = (itemType ?? "property").ToLowerInvariant();
            var query = _unitOfWork.SavedListings.Query();

            SavedListings savedListing;

            if (normalizedType == "tour")
            {
                savedListing = await query.FirstOrDefaultAsync(sl =>
                    sl.UserID == userId && sl.ItemType == "tour" && sl.TourID == itemId);
            }
            else
            {
                savedListing = await query.FirstOrDefaultAsync(sl =>
                    sl.UserID == userId && sl.ItemType == "property" && sl.PropertyID == itemId);
            }

            if (savedListing != null)
            {
                _unitOfWork.SavedListings.Remove(savedListing);
                await _unitOfWork.SaveChangesAsync();
            }

            return await GetUserWishlistAsync(userId);
        }
    }
}

