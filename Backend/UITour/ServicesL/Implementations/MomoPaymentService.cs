using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using UITour.Models;
using UITour.Models.Payments;
using UITour.ServicesL.Interfaces;

namespace UITour.ServicesL.Implementations
{
    public class MomoPaymentService : IMomoPaymentService
    {
        private readonly HttpClient _httpClient;
        private readonly MomoSettings _settings;
        private readonly ILogger<MomoPaymentService> _logger;
        private readonly JsonSerializerOptions _serializerOptions = new(JsonSerializerDefaults.Web);

        public MomoPaymentService(HttpClient httpClient, IOptions<MomoSettings> settings, ILogger<MomoPaymentService> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<MomoPaymentResponse> CreatePaymentAsync(
            decimal amountVnd,
            string orderId,
            string orderInfo,
            string? extraData = null,
            string? redirectUrlOverride = null)
        {
            if (amountVnd <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(amountVnd), "Amount must be greater than zero.");
            }

            if (string.IsNullOrWhiteSpace(_settings.Endpoint))
            {
                throw new InvalidOperationException("Momo endpoint is not configured.");
            }

            var requestId = Guid.NewGuid().ToString("N");
            var normalizedAmount = Convert.ToInt64(Math.Round(amountVnd, MidpointRounding.AwayFromZero));
            var normalizedExtraData = extraData ?? string.Empty;
            var requestType = _settings.RequestType ?? "captureWallet";

            var redirectUrl = string.IsNullOrWhiteSpace(redirectUrlOverride)
                ? _settings.RedirectUrl
                : redirectUrlOverride;

            var ipnUrl = _settings.IpnUrl;

            if (string.IsNullOrWhiteSpace(redirectUrl))
            {
                throw new InvalidOperationException("Momo redirect URL is not configured.");
            }

            if (string.IsNullOrWhiteSpace(ipnUrl))
            {
                throw new InvalidOperationException("Momo IPN URL is not configured.");
            }

            var signature = BuildSignature(
                normalizedAmount,
                orderId,
                orderInfo,
                requestId,
                normalizedExtraData,
                requestType,
                redirectUrl,
                ipnUrl);

            var payload = new
            {
                partnerCode = _settings.PartnerCode,
                partnerName = _settings.PartnerName,
                storeId = _settings.StoreId,
                requestType,
                ipnUrl,
                redirectUrl,
                lang = "vi",
                amount = normalizedAmount.ToString(),
                orderId,
                orderInfo,
                requestId,
                extraData = normalizedExtraData,
                autoCapture = true,
                orderGroupId = string.Empty,
                signature
            };

            _logger.LogInformation("Creating Momo sandbox payment for order {OrderId} amount {Amount}", orderId, normalizedAmount);

            var response = await _httpClient.PostAsJsonAsync(_settings.Endpoint, payload, _serializerOptions);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Momo payment creation failed with status {Status}: {Body}", response.StatusCode, responseContent);
                throw new InvalidOperationException("Failed to create Momo payment.");
            }

            var momoResponse = JsonSerializer.Deserialize<MomoPaymentResponse>(responseContent, _serializerOptions)
                ?? throw new InvalidOperationException("Unable to parse Momo response.");

            if (momoResponse.ResultCode != 0)
            {
                _logger.LogWarning("Momo returned error {Code}: {Message}", momoResponse.ResultCode, momoResponse.Message);
                throw new InvalidOperationException($"Momo error: {momoResponse.Message}");
            }

            return momoResponse;
        }

        private string BuildSignature(
            long amount,
            string orderId,
            string orderInfo,
            string requestId,
            string extraData,
            string requestType,
            string redirectUrl,
            string ipnUrl)
        {
            var rawSignature =
                $"accessKey={_settings.AccessKey}" +
                $"&amount={amount}" +
                $"&extraData={extraData}" +
                $"&ipnUrl={ipnUrl}" +
                $"&orderId={orderId}" +
                $"&orderInfo={orderInfo}" +
                $"&partnerCode={_settings.PartnerCode}" +
                $"&redirectUrl={redirectUrl}" +
                $"&requestId={requestId}" +
                $"&requestType={requestType}";

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_settings.SecretKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawSignature));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }
    }
}
