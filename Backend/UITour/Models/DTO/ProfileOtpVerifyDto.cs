using System.ComponentModel.DataAnnotations;

public class ProfileOtpVerifyDto
{
    [Required]
    [StringLength(6, MinimumLength = 4)]
    public string Otp { get; set; } = string.Empty;
}

