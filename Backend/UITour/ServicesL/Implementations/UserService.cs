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
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<User> GetByIdAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException("User not found");

            return user;
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            var user = await _unitOfWork.Users.Query().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                throw new InvalidOperationException("User not found");

            return user;
        }

        public async Task<User> RegisterAsync(User user, string password)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            user.RegisteredAt = DateTime.Now;
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return user;
        }

        public async Task<(User user, string token)> LoginAsync(string email, string password)
        {
            var user = await GetByEmailAsync(email);
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                throw new InvalidOperationException("Invalid credentials");

            var token = GenerateToken(user);
            return (user, token);
        }

        public async Task<bool> UpdateProfileAsync(int userId, UpdateUserProfileDto dto)
        {
            var existingUser = await GetByIdAsync(userId);
            if (existingUser == null) throw new InvalidOperationException("User not found");

            // Cập nhật các trường từ DTO
            existingUser.FullName = dto.FullName;
            existingUser.Phone = dto.Phone;
            existingUser.UserAbout = dto.UserAbout;
            existingUser.Age = dto.Age;
            existingUser.Gender = dto.Gender;
            existingUser.Nationality = dto.Nationality;
            existingUser.Interests = dto.Interests;

            _unitOfWork.Users.Update(existingUser);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserRoleAsync(int userId, string newRole)
        {
            var user = await GetByIdAsync(userId);
            if (user == null) throw new InvalidOperationException("User not found");

            user.Role = newRole;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserEmailAsync(int userId, string newEmail)
        {
            var user = await GetByIdAsync(userId);
            if (user == null) throw new InvalidOperationException("User not found");

            // Optional: kiểm tra email đã tồn tại
            var existing = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == newEmail);
            if (existing != null && existing.UserID != userId)
                throw new InvalidOperationException("Email is already in use");

            user.Email = newEmail;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await GetByIdAsync(userId);
            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
                throw new InvalidOperationException("Invalid current password");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAccountAsync(int userId)
        {
            var user = await GetByIdAsync(userId);
            if (user == null) return false;

            _unitOfWork.Users.Remove(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            // Token validation logic here
            return true;
        }

        public async Task<IEnumerable<SavedListing>> GetSavedListingsAsync(int userId)
        {
            return await _unitOfWork.SavedListings.Query().Where(sl => sl.UserID == userId).ToListAsync();
        }

        private string GenerateToken(User user)
        {
            // Token generation logic here
            return "generated_token";
        }
    }
}