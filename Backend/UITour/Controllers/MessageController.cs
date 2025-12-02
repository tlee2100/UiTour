using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UITour.Models;
using UITour.ServicesL.Interfaces;

namespace UITour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;

        public MessagesController(IMessageService messageService)
        {
            _messageService = messageService;
        }

        // POST: api/messages
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest("Invalid message payload");

            var message = await _messageService.SendMessageAsync(
                dto.FromUserID,
                dto.ToUserID,
                dto.Content,
                dto.BookingID
            );

            return Ok(message);
        }

        // GET: api/messages/conversation/{user1}/{user2}
        [HttpGet("conversation/{user1}/{user2}")]
        public async Task<IActionResult> GetConversation(int user1, int user2)
        {
            var messages = await _messageService.GetConversationAsync(user1, user2);
            return Ok(messages);
        }

        // GET: api/messages/booking/{bookingId}
        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetMessagesByBooking(int bookingId)
        {
            var messages = await _messageService.GetMessagesByBookingAsync(bookingId);
            return Ok(messages);
        }

        // PUT: api/messages/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _messageService.MarkAsReadAsync(id);
            return NoContent();
        }
        // GET: api/messages/conversations/{userId}
        [HttpGet("conversations/{userId}")]
        public async Task<IActionResult> GetUserConversations(int userId)
        {
            var conversations = await _messageService.GetUserConversationsAsync(userId);
            return Ok(conversations);
        }
    }

    // DTO để gửi tin nhắn
    public class SendMessageDto
    {
        public int FromUserID { get; set; }
        public int ToUserID { get; set; }
        public int? BookingID { get; set; }
        public string Content { get; set; }
    }
}
