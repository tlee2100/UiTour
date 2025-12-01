namespace UITour.Models
{
    public class MomoSettings
    {
        public string PartnerCode { get; set; } = string.Empty;
        public string AccessKey { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
        public string Endpoint { get; set; } = string.Empty;
        public string RedirectUrl { get; set; } = string.Empty;
        public string IpnUrl { get; set; } = string.Empty;
        public string RequestType { get; set; } = "captureWallet";
        public string PartnerName { get; set; } = "UITour Sandbox";
        public string StoreId { get; set; } = "UITourSandboxStore";
        public decimal DefaultUsdToVndRate { get; set; } = 24000m;
    }
}

