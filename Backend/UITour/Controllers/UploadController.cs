using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using UITour.ServicesL.Interfaces;
using Microsoft.Extensions.Logging;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IPhotoService _photoService;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IPhotoService photoService, ILogger<UploadController> logger)
        {
            _photoService = photoService;
            _logger = logger;
        }

        // POST: api/upload/image
        [HttpPost("image")]
        [Authorize]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file uploaded" });

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(new { error = "Invalid file type. Only images are allowed." });

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { error = "File size exceeds 10MB limit" });

            try
            {
                var result = await _photoService.AddPhotoAsync(file);

                if (result.Error != null)
                {
                    _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
                    return BadRequest(new { error = result.Error.Message });
                }

                var url = result.SecureUrl?.AbsoluteUri ?? result.Url?.AbsoluteUri;
                return Ok(new { url, publicId = result.PublicId, fileName = file.FileName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image to Cloudinary");
                return StatusCode(500, new { error = "Failed to upload image" });
            }
        }

        // POST: api/upload/images (multiple files)
        [HttpPost("images")]
        [Authorize]
        public async Task<IActionResult> UploadImages()
        {
            var files = Request.Form.Files;
            if (files == null || files.Count == 0)
                return BadRequest(new { error = "No files uploaded" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var uploadedFiles = new List<object>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                    continue;

                if (file.Length > 10 * 1024 * 1024)
                    continue;

                try
                {
                    var result = await _photoService.AddPhotoAsync(file);

                    if (result.Error != null)
                    {
                        _logger.LogError("Cloudinary upload failed for file {FileName}: {Error}", file.FileName, result.Error.Message);
                        continue;
                    }

                    var url = result.SecureUrl?.AbsoluteUri ?? result.Url?.AbsoluteUri;
                    uploadedFiles.Add(new { url, publicId = result.PublicId, fileName = file.FileName });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error uploading file {file.FileName}");
                }
            }

            return Ok(new { files = uploadedFiles });
        }

        // DELETE: api/upload/image/{publicId}
        [HttpDelete("image/{publicId}")]
        [Authorize]
        public async Task<IActionResult> DeleteImage(string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId))
                return BadRequest(new { error = "PublicId is required" });

            try
            {
                var result = await _photoService.DeletePhotoAsync(publicId);
                if (result.Error != null)
                {
                    _logger.LogError("Cloudinary delete failed: {Error}", result.Error.Message);
                    return BadRequest(new { error = result.Error.Message });
                }

                return Ok(new { message = "Image deleted successfully", result = result.Result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image from Cloudinary");
                return StatusCode(500, new { error = "Failed to delete image" });
            }
        }
    }
}
