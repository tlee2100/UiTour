using System.Text.Json.Serialization;

namespace UITour.Models.Payments
{
    public class MomoPaymentResponse
    {
        [JsonPropertyName("resultCode")]
        public int ResultCode { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("payUrl")]
        public string? PayUrl { get; set; }

        [JsonPropertyName("qrCodeUrl")]
        public string? QrCodeUrl { get; set; }

        [JsonPropertyName("qrCodeBase64")]
        public string? QrCodeBase64 { get; set; }

        [JsonPropertyName("deeplink")]
        public string? Deeplink { get; set; }

        [JsonPropertyName("deeplinkMiniApp")]
        public string? DeeplinkMiniApp { get; set; }

        [JsonPropertyName("orderId")]
        public string? OrderId { get; set; }

        [JsonPropertyName("requestId")]
        public string? RequestId { get; set; }
    }
}

