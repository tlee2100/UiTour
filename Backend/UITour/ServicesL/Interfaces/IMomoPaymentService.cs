using UITour.Models.Payments;

namespace UITour.ServicesL.Interfaces
{
    public interface IMomoPaymentService
    {
        Task<MomoPaymentResponse> CreatePaymentAsync(
            decimal amountVnd,
            string orderId,
            string orderInfo,
            string? extraData = null,
            string? redirectUrlOverride = null);
    }
}

