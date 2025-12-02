using UITour.Models;

namespace UITour.ServicesL.Interfaces
{
    public interface IMessageService
    {
        Task<Message> SendMessageAsync(int fromUserId, int toUserId, string content, int? bookingId = null);
        Task<IEnumerable<Message>> GetConversationAsync(int userId1, int userId2);
        Task<IEnumerable<Message>> GetMessagesByBookingAsync(int bookingId);
        Task MarkAsReadAsync(int messageId);
        Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(int userId);
    }

}
