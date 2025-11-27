using System.ComponentModel.DataAnnotations;

namespace UITour.Models.DTO
{
    public class CreateReviewDto
    {
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars.")]
        public byte Rating { get; set; }

        [MaxLength(4000)]
        public string Comments { get; set; } = string.Empty;

        /// <summary>
        /// Optional safeguard to ensure the request comes from the booking owner.
        /// </summary>
        public int? UserId { get; set; }
    }
}

