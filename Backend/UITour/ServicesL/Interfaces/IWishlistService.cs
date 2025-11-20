using UITour.Models.DTO;

namespace UITour.ServicesL.Interfaces
{
    public interface IWishlistService
    {
        Task<WishlistDto> GetUserWishlistAsync(int userId);
        Task<WishlistDto> AddToWishlistAsync(int userId, int itemId, string itemType);
        Task<WishlistDto> RemoveFromWishlistAsync(int userId, int itemId, string itemType);
    }
}

