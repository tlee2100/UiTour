using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using UITour.Models;
using UITour.DAL.Interfaces;
using UITour.ServicesL.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;

namespace UITour.ServicesL.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;
        private const string RegistrationOtpPrefix = "register_otp_";
        private const string RegistrationVerifiedPrefix = "register_verified_";

        public UserService(IUnitOfWork unitOfWork, IMemoryCache cache, IEmailService emailService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
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
            var normalizedEmail = NormalizeEmail(email);
            var user = await _unitOfWork.Users.Query()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            if (user == null)
                throw new InvalidOperationException("User not found");

            return user;
        }

        public async Task<User> RegisterAsync(User user, string password)
        {
            if (string.IsNullOrWhiteSpace(user?.Email))
                throw new InvalidOperationException("Email is required");

            var normalizedEmail = NormalizeEmail(user.Email);

            var exists = await _unitOfWork.Users.Query()
                .AnyAsync(u => u.Email.ToLower() == normalizedEmail);
            if (exists)
                throw new InvalidOperationException("Email is already registered");

            if (!_cache.TryGetValue($"{RegistrationVerifiedPrefix}{normalizedEmail}", out bool isVerified) || !isVerified)
                throw new InvalidOperationException("Please verify your email before creating an account.");

            user.Email = user.Email.Trim();
            user.FullName = user.FullName?.Trim() ?? string.Empty;
            user.Phone = user.Phone?.Trim();

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            user.RegisteredAt = DateTime.Now;
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            _cache.Remove($"{RegistrationVerifiedPrefix}{normalizedEmail}");

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

        public async Task<bool> UpdateUserPhoneAsync(int userId, string newPhone)
        {
            var user = await GetByIdAsync(userId);
            if (user == null) throw new InvalidOperationException("User not found");
            user.Phone = newPhone;
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

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _unitOfWork.Users.Query().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new InvalidOperationException("User not found");

            // Sinh OTP
            var otp = new Random().Next(100000, 999999).ToString();

            // Lưu OTP vào cache với thời hạn 5 phút
            _cache.Set($"otp_{email}", otp, TimeSpan.FromMinutes(5));

            // Gửi email
            await _emailService.SendAsync(email, "Password Reset OTP", $"Your OTP code is {otp}");

            return true;
        }

        public async Task<bool> ResetPasswordAsync(string email, string otp, string newPassword)
        {
            // Kiểm tra OTP trong cache
            if (!_cache.TryGetValue($"otp_{email}", out string cachedOtp) || cachedOtp != otp)
                throw new InvalidOperationException("Invalid or expired OTP");

            var user = await _unitOfWork.Users.Query().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new InvalidOperationException("User not found");

            // Hash mật khẩu mới
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();

            _cache.Remove($"otp_{email}");

            return true;
        }

        public async Task<string> SendRegistrationOtpAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new InvalidOperationException("Email is required");

            var normalizedEmail = NormalizeEmail(email);

            var alreadyExists = await _unitOfWork.Users.Query()
                .AnyAsync(u => u.Email.ToLower() == normalizedEmail);
            if (alreadyExists)
                throw new InvalidOperationException("Email is already registered");

            var otp = GenerateOtpCode();

            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            };

            _cache.Set($"{RegistrationOtpPrefix}{normalizedEmail}", otp, cacheOptions);
            _cache.Remove($"{RegistrationVerifiedPrefix}{normalizedEmail}");

            var body = $"<p>Your UiTour verification code is <strong>{otp}</strong>.</p><p>This code expires in 10 minutes.</p>";
            await _emailService.SendAsync(email, "Verify your UiTour account", body);

            return otp;
        }

        public async Task<bool> VerifyRegistrationOtpAsync(string email, string otp)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp))
                throw new InvalidOperationException("Email and OTP are required");

            var normalizedEmail = NormalizeEmail(email);

            if (!_cache.TryGetValue($"{RegistrationOtpPrefix}{normalizedEmail}", out string cachedOtp))
                throw new InvalidOperationException("OTP has expired or is invalid");

            if (!string.Equals(cachedOtp, otp, StringComparison.Ordinal))
                throw new InvalidOperationException("OTP is incorrect");

            _cache.Remove($"{RegistrationOtpPrefix}{normalizedEmail}");
            _cache.Set($"{RegistrationVerifiedPrefix}{normalizedEmail}", true, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
            });

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

        public async Task<IEnumerable<SavedListings>> GetSavedListingsAsync(int userId)
        {
            return await _unitOfWork.SavedListings.Query().Where(sl => sl.UserID == userId).ToListAsync();
        }

        private string GenerateToken(User user)
        {
            // Token generation logic here
            return "generated_token";
        }

        private static string NormalizeEmail(string email)
        {
            return (email ?? string.Empty).Trim().ToLowerInvariant();
        }

        private static string GenerateOtpCode()
        {
            return RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
        }
    }
}