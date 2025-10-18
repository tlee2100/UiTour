using System;
using System.Threading.Tasks;
using System.Security.Claims;
using UITour.Models;

namespace UITour.ServicesL.Interfaces
{
    public interface IUserService
    {
        Task<User> GetByIdAsync(int id);
        Task<User> GetByEmailAsync(string email);
        Task<User> RegisterAsync(User user, string password);
        Task<(User user, string token)> LoginAsync(string email, string password);
        Task<bool> UpdateProfileAsync(User user);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<bool> DeleteAccountAsync(int userId);
        Task<bool> ValidateTokenAsync(string token);
        Task<IEnumerable<SavedListing>> GetSavedListingsAsync(int userId);
    }
}