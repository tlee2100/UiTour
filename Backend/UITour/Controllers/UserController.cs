using Microsoft.AspNetCore.Mvc;
using UITour.Models;
using UITour.ServicesL.Implementations;
using UITour.ServicesL.Interfaces;

namespace UITour.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
       
        // GET: api/user/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // GET: api/user/email/{email}
        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            try
            {
                var user = await _userService.GetByEmailAsync(email);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/user/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationRequest request)
        {
            try
            {
                var user = new User
                {
                    FullName = request.FullName,
                    Email = request.Email,
                    Phone = request.Phone
                };

                var registeredUser = await _userService.RegisterAsync(user, request.Password);
                return CreatedAtAction(nameof(GetById), new { id = registeredUser.UserID }, registeredUser);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/user/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var (user, token) = await _userService.LoginAsync(request.Email, request.Password);
                return Ok(new { user, token });
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // PUT: api/user/{id}/profile
        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateUserProfileDto dto)
        {
            try
            {
                var result = await _userService.UpdateProfileAsync(id, dto);
                return result
                    ? Ok(new { message = "Profile updated successfully" })
                    : BadRequest("Failed to update profile");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }


        // PUT: api/user/{id}/role
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            try
            {
                // Optional: kiểm tra quyền admin ở đây nếu cần
                // if (!User.IsInRole("Admin")) return Forbid();

                var result = await _userService.UpdateUserRoleAsync(id, dto.Role);
                return result
                    ? Ok(new { message = "User role updated successfully" })
                    : BadRequest("Failed to update role");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // PUT: api/user/{id}/email
        [HttpPut("{id}/email")]
        public async Task<IActionResult> UpdateEmail(int id, [FromBody] UpdateUserEmailDto dto)
        {
            try
            {
                var result = await _userService.UpdateUserEmailAsync(id, dto.NewEmail);
                return result
                    ? Ok(new { message = "Email updated successfully" })
                    : BadRequest("Failed to update email");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT: api/user/{id}/phone
        [HttpPut("{id}/phone")]
        public async Task<IActionResult> UpdatePhone(int id, [FromBody] UpdateUserPhoneDto dto)
        {
            try
            {
                var result = await _userService.UpdateUserPhoneAsync(id, dto.NewPhone);
                return result
                    ? Ok(new { message = "Phone number updated successfully" })
                    : BadRequest("Failed to update phone number");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT: api/user/{id}/change-password
        [HttpPut("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            try
            {
                var result = await _userService.ChangePasswordAsync(id, request.CurrentPassword, request.NewPassword);
                return result ? Ok(new { message = "Password changed successfully" }) : BadRequest("Failed to change password");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/user/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            try
            {
                var result = await _userService.DeleteAccountAsync(id);
                return result ? Ok(new { message = "Account deleted successfully" }) : BadRequest("Failed to delete account");
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/user/validate-token
        [HttpPost("validate-token")]
        public async Task<IActionResult> ValidateToken([FromBody] TokenValidationRequest request)
        {
            try
            {
                var result = await _userService.ValidateTokenAsync(request.Token);
                return Ok(new { isValid = result });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/user/{id}/saved-listings
        [HttpGet("{id}/saved-listings")]
        public async Task<IActionResult> GetSavedListings(int id)
        {
            try
            {
                var savedListings = await _userService.GetSavedListingsAsync(id);
                return Ok(savedListings);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    // DTOs for request/response
    public class UserRegistrationRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class TokenValidationRequest
    {
        public string Token { get; set; } = string.Empty;
    }
}
