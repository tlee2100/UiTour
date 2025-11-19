using Microsoft.AspNetCore.Mvc;
using UITour.Models.DTO;
using UITour.ServicesL.Interfaces;

namespace UITour.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService ?? throw new ArgumentNullException(nameof(wishlistService));
        }

        // GET: api/wishlist/{userId}
        [HttpGet("{userId:int}")]
        public async Task<ActionResult<WishlistDto>> GetUserWishlist(int userId)
        {
            try
            {
                var wishlist = await _wishlistService.GetUserWishlistAsync(userId);
                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine($"Error getting wishlist for user {userId}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST: api/wishlist/{userId}/add/{itemId}?type=property|tour
        [HttpPost("{userId:int}/add/{itemId:int}")]
        public async Task<ActionResult<WishlistDto>> AddToWishlist(int userId, int itemId, [FromQuery] string type = "property")
        {
            try
            {
                var wishlist = await _wishlistService.AddToWishlistAsync(userId, itemId, type);
                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE: api/wishlist/{userId}/remove/{itemId}?type=property|tour
        [HttpDelete("{userId:int}/remove/{itemId:int}")]
        public async Task<ActionResult<WishlistDto>> RemoveFromWishlist(int userId, int itemId, [FromQuery] string type = "property")
        {
            try
            {
                var wishlist = await _wishlistService.RemoveFromWishlistAsync(userId, itemId, type);
                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}

