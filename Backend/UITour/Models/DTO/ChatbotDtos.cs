using System.Collections.Generic;

namespace UITour.Models.DTO.Chatbot
{
    public class ChatHistoryMessageDto
    {
        public string Role { get; set; } = "user";
        public string Content { get; set; } = string.Empty;
    }

    public class ChatRequestDto
    {
        public string Message { get; set; } = string.Empty;
        public List<ChatHistoryMessageDto> History { get; set; } = new();
    }

    public class ChatResponseDto
    {
        public string Reply { get; set; } = string.Empty;
        public string KnowledgeUsed { get; set; } = string.Empty;
        public bool UsedFallback { get; set; }
    }
}

