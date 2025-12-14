using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UITour.DAL.Interfaces;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/admin/stats")]
    public class AdminStatsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminStatsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/admin/stats/revenue-by-month?year=2025
        [HttpGet("revenue-by-month")]
        public async Task<IActionResult> GetRevenueByMonth([FromQuery] int? year = null)
        {
            var targetYear = year ?? DateTime.UtcNow.Year;

            // NOTE: Bạn có thể chỉnh điều kiện doanh thu theo nghiệp vụ:
            // - PaymentStatus == "Success" / "Paid"
            // - ApprovalStatus == "approved"
            // - hoặc join Booking.Status == "Confirmed"
            var txQuery = _unitOfWork.Transactions.Query()
                .AsNoTracking()
                .Where(t => t.ProcessedAt.Year == targetYear);

            // Ví dụ lọc "thành công" (tùy bạn đang lưu thế nào)
            txQuery = txQuery.Where(t =>
                (t.PaymentStatus != null && (t.PaymentStatus == "Success" || t.PaymentStatus == "Paid")) ||
                (t.ApprovalStatus != null && t.ApprovalStatus == "approved")
            );

            var grouped = await txQuery
                .GroupBy(t => t.ProcessedAt.Month)
                .Select(g => new { Month = g.Key, Total = g.Sum(x => x.Amount) })
                .ToListAsync();

            // trả về đủ 12 tháng
            var result = new decimal[12];
            foreach (var item in grouped)
            {
                if (item.Month >= 1 && item.Month <= 12)
                    result[item.Month - 1] = item.Total;
            }

            return Ok(new
            {
                year = targetYear,
                currency = "USD",
                monthly = result
            });
        }

        // GET: api/admin/stats/user-growth?year=2025
        [HttpGet("user-growth")]
        public async Task<IActionResult> GetUserGrowth([FromQuery] int? year = null)
        {
            var targetYear = year ?? DateTime.UtcNow.Year;

            var usersQuery = _unitOfWork.Users.Query()
                .AsNoTracking()
                .Where(u => u.RegisteredAt.Year == targetYear);

            var grouped = await usersQuery
                .GroupBy(u => u.RegisteredAt.Month)
                .Select(g => new { Month = g.Key, Count = g.Count() })
                .ToListAsync();

            var result = new int[12];
            foreach (var item in grouped)
            {
                if (item.Month >= 1 && item.Month <= 12)
                    result[item.Month - 1] = item.Count;
            }

            return Ok(new
            {
                year = targetYear,
                monthly = result
            });
        }
    }
}
