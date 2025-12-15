using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UITour.DAL.Interfaces;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public TransactionController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/transaction
        // Admin xem tất cả giao dịch
        [HttpGet]
        // [Authorize(Roles = "Admin")] // mở lại nếu bạn đã set role theo JWT
        public async Task<IActionResult> GetAll()
        {
            var data = await _unitOfWork.Transactions.Query()
                .AsNoTracking()
                .OrderByDescending(t => t.ProcessedAt)
                .Select(t => new
                {
                    t.TransactionID,
                    t.BookingID,
                    t.Amount,
                    t.Currency,
                    t.PaymentMethod,
                    t.PaymentStatus,
                    t.ProcessedAt,
                    t.ApprovalStatus,
                    t.ApprovedBy,
                    t.ApprovedAt,
                    t.BankName,
                    t.BankAccount,
                    t.TransactionContent
                })
                .ToListAsync();

            return Ok(data);
        }
    }
}
