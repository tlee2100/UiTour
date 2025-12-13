using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using UITour.DAL.Interfaces;
using UITour.Models;
using UITour.ServicesL.Interfaces;

namespace UITour.ServicesL.Implementations
{
    public class MessageService : IMessageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHubContext<MessageHub> _hub;
        public MessageService(IUnitOfWork unitOfWork, IHubContext<MessageHub> hub)
        {
            _unitOfWork = unitOfWork;
            _hub = hub;
        }

        public async Task<Message> SendMessageAsync(int fromUserId, int toUserId, string content, int? bookingId = null)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Message content cannot be empty");

            var toUser = await _unitOfWork.Users.GetByIdAsync(toUserId);
            if (toUser == null)
                throw new ArgumentException("Recipient does not exist");

            // Use local server time consistently for SentAt so frontend "time ago" is stable
            var message = new Message
            {
                FromUserID = fromUserId,
                ToUserID = toUserId,
                BookingID = bookingId,
                Content = content.Trim(),
                SentAt = DateTime.Now,
                IsRead = false
            };

            await _unitOfWork.Messages.AddAsync(message);
            await _unitOfWork.SaveChangesAsync();

            // ⭐ broadcast SignalR real-time
            await _hub.Clients.User(toUserId.ToString()).SendAsync("ReceiveMessage", new
            {
                fromUserId,
                toUserId,
                content = message.Content,
                sentAt = message.SentAt,
                bookingId = message.BookingID
            });

            return message;
        }
        public async Task<IEnumerable<MessageDto>> GetConversationAsync(int userId1, int userId2)
        {
            var messages = await _unitOfWork.Messages.Query()
                .Where(m =>
                    (m.FromUserID == userId1 && m.ToUserID == userId2) ||
                    (m.FromUserID == userId2 && m.ToUserID == userId1))
                .Include(m => m.FromUser)
                .Include(m => m.ToUser)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return messages.Select(m => new MessageDto
            {
                MessageID = m.MessageID,
                FromUserID = m.FromUserID ?? 0,
                ToUserID = m.ToUserID ?? 0,
                Content = m.Content,
                SentAt = m.SentAt,
                IsRead = m.IsRead,
                PartnerId = m.FromUserID == userId1 ? m.ToUserID ?? 0 : m.FromUserID ?? 0,
                PartnerName = m.FromUserID == userId1 ? m.ToUser?.FullName ?? "" : m.FromUser?.FullName ?? "",
                FromUserAvatar = m.FromUser?.Avatar ?? "",
                ToUserAvatar = m.ToUser?.Avatar ?? ""
            });
        }


        public async Task<IEnumerable<Message>> GetMessagesByBookingAsync(int bookingId)
        {
            return await _unitOfWork.Messages.Query()
                .Where(m => m.BookingID == bookingId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }

        public async Task MarkAsReadAsync(int messageId)
        {
            var message = await _unitOfWork.Messages.GetByIdAsync(messageId);
            if (message == null)
                throw new KeyNotFoundException($"Message {messageId} not found");

            message.IsRead = true;
            _unitOfWork.Messages.Update(message);
            await _unitOfWork.SaveChangesAsync();
        }
        public async Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(int userId)
        {
            var messages = await _unitOfWork.Messages.Query()
                .Where(m => m.FromUserID == userId || m.ToUserID == userId)
                .Include(m => m.FromUser)
                .Include(m => m.ToUser)
                .ToListAsync();

            var conversations = messages
                .GroupBy(m => m.FromUserID == userId ? m.ToUserID : m.FromUserID)
                .Select(g =>
                {
                    var lastMsg = g.OrderByDescending(m => m.SentAt).FirstOrDefault();
                    var partner = lastMsg.FromUserID == userId ? lastMsg.ToUser : lastMsg.FromUser;

                    return new ConversationDto
                    {
                        ConversationId = partner.UserID,
                        PartnerName = partner.FullName,
                        PartnerAvatar = partner.Avatar, // nếu có field avatar thì gán
                        LastMessage = lastMsg.Content,
                        LastMessageAt = lastMsg.SentAt,
                        UnreadCount = g.Count(m => !m.IsRead && m.ToUserID == userId)
                    };
                })
                .OrderByDescending(c => c.LastMessageAt)
                .ToList();

            return conversations;
        }
    }
}

public class ConversationDto
{
    public int ConversationId { get; set; } // chính là partnerId
    public string PartnerName { get; set; }
    public string PartnerAvatar { get; set; } // nếu có
    public string LastMessage { get; set; }
    public DateTime LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
}

public class MessageDto
{
    public int MessageID { get; set; }
    public int FromUserID { get; set; }
    public int ToUserID { get; set; }
    public string Content { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }

    public int PartnerId { get; set; } // người đối diện
    public string PartnerName { get; set; }
    // 👇 thêm avatar
    public string FromUserAvatar { get; set; }
    public string ToUserAvatar { get; set; }
}