using System.ComponentModel.DataAnnotations;

namespace UITour.Models
{
    public class VerificationType
    {
        [Key] 
        public int VerificationTypeID { get; set; }
        [Required, StringLength(100)] 
        public string VerificationName { get; set; }
        public ICollection<HostVerification> HostVerifications { get; set; }
    }
}
