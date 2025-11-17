namespace UITour.Models.DTO
{
    public class RegistrationOtpRequestDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class RegistrationOtpVerificationDto
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }
}

