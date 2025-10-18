using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class HostVerification
    {
        [Key] public int HostVerificationID { get; set; }
        [Required][ForeignKey("Host")] public int HostID { get; set; }
        public Host? Host { get; set; } // Navigation property
        [ForeignKey("VerificationType")] public int? VerificationTypeID { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? Details { get; set; }
    }
}
