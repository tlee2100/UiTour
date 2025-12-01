using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.Text.Json;
using UITour.Models;
using UITour.Models.Payments;
using UITour.ServicesL.Interfaces;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IMomoPaymentService _momoPaymentService;
        private readonly ILogger<PaymentsController> _logger;
        private readonly MomoSettings _momoSettings;

        public PaymentsController(IMomoPaymentService momoPaymentService, ILogger<PaymentsController> logger, IOptions<MomoSettings> momoOptions)
        {
            _momoPaymentService = momoPaymentService;
            _logger = logger;
            _momoSettings = momoOptions.Value;
        }

        [HttpPost("momo/initiate")]
        public async Task<IActionResult> InitiateMomoPayment([FromBody] CreateMomoPaymentRequest request)
        {
            if (request == null || request.AmountUsd <= 0)
            {
                return BadRequest(new { error = "Amount must be greater than zero." });
            }

            var bookingId = request.BookingId ?? 0;
            if (bookingId <= 0)
            {
                return BadRequest(new { error = "BookingId is required for Momo payments." });
            }

            try
            {
                var amountVnd = request.AmountVnd.HasValue && request.AmountVnd > 0
                    ? request.AmountVnd.Value
                    : ConvertUsdToVnd(request.AmountUsd);

                var orderId = BuildOrderId(bookingId, request.OrderId);
                var orderInfo = string.IsNullOrWhiteSpace(request.Description)
                    ? $"UITour booking {bookingId}"
                    : request.Description;

                var redirectUrl = ResolveRedirectUrl(request.ReturnUrl, bookingId);
                var extraData = JsonSerializer.Serialize(new
                {
                    bookingId,
                    orderId
                });

                var momoResponse = await _momoPaymentService.CreatePaymentAsync(
                    amountVnd,
                    orderId,
                    orderInfo,
                    extraData,
                    redirectUrl);

                return Ok(new
                {
                    momoResponse.PayUrl,
                    momoResponse.QrCodeUrl,
                    momoResponse.QrCodeBase64,
                    momoResponse.Deeplink,
                    momoResponse.ResultCode,
                    momoResponse.Message,
                    momoResponse.OrderId,
                    momoResponse.RequestId,
                    amountVnd
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initiate Momo payment for booking {BookingId}", request?.BookingId);
                return BadRequest(new { error = ex.Message });
            }
        }

        private decimal ConvertUsdToVnd(decimal amountUsd)
        {
            var rate = _momoSettings.DefaultUsdToVndRate > 0 ? _momoSettings.DefaultUsdToVndRate : 24000m;
            return Math.Max(1000m, Math.Round(amountUsd * rate, 0, MidpointRounding.AwayFromZero));
        }

        private static string BuildOrderId(int bookingId, string? requestedOrderId)
        {
            var baseOrderId = string.IsNullOrWhiteSpace(requestedOrderId)
                ? $"booking-{bookingId}"
                : requestedOrderId;

            var uniqueSuffix = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
            var orderId = $"{baseOrderId}-{uniqueSuffix}";

            return orderId.Length > 45 ? orderId[^45..] : orderId;
        }

        private string ResolveRedirectUrl(string? requestedReturnUrl, int bookingId)
        {
            var baseUrl = string.IsNullOrWhiteSpace(requestedReturnUrl)
                ? _momoSettings.RedirectUrl
                : requestedReturnUrl.Trim();

            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                throw new InvalidOperationException("No redirect URL configured for Momo payments.");
            }

            if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var uri) ||
                (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            {
                throw new InvalidOperationException("ReturnUrl must be an absolute HTTP or HTTPS URL.");
            }

            var normalizedUrl = baseUrl;

            if (bookingId > 0 && !baseUrl.Contains("bookingId", StringComparison.OrdinalIgnoreCase))
            {
                normalizedUrl = QueryHelpers.AddQueryString(baseUrl, "bookingId", bookingId.ToString());
            }

            return normalizedUrl;
        }

    }
}

