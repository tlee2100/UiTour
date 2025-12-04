using System.Threading.Tasks;
using UITour.Models.DTO.Chatbot;

namespace UITour.ServicesL.Interfaces
{
    public interface IChatbotService
    {
        Task<ChatResponseDto> AskAsync(ChatRequestDto request);
    }
}

