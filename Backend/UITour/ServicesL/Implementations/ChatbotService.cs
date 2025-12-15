using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using UITour.ServicesL.Interfaces;
using UITour.Models.DTO.Chatbot; // adjust namespace if you moved DTOs
using Microsoft.Extensions.Configuration;

namespace UITour.ServicesL.Implementations
{
    public class ChatbotService : IChatbotService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ChatbotService> _logger;
        private readonly string _baseUrl;
        private readonly string _model;

        public ChatbotService(HttpClient httpClient, ILogger<ChatbotService> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _baseUrl = configuration["Ollama:BaseUrl"]?.TrimEnd('/') ?? "http://localhost:11434";
            _model = configuration["Ollama:Model"] ?? "llama3";
        }

        public async Task<ChatResponseDto> AskAsync(ChatRequestDto request)
        {
            var fallback = new ChatResponseDto
            {
                Reply = "Our AI assistant isn't available right now. Please try again later.",
                KnowledgeUsed = string.Empty,
                UsedFallback = true
            };

            try
            {
                var messages = new List<object>
                {
                    new
                    {
                        role = "system",
                        content = "You are a helpful assistant."
                    }
                };

                if (request.History is { Count: > 0 })
                {
                    foreach (var entry in request.History.TakeLast(8))
                    {
                        messages.Add(new
                        {
                            role = entry.Role == "assistant" ? "assistant" : "user",
                            content = entry.Content
                        });
                    }
                }

                messages.Add(new { role = "user", content = request.Message });

                var payload = new
                {
                    model = _model,
                    messages,
                    stream = false
                };

                var httpRequest = new HttpRequestMessage(
                    HttpMethod.Post,
                    $"{_baseUrl}/api/chat")
                {
                    Content = new StringContent(
                        JsonSerializer.Serialize(payload),
                        Encoding.UTF8,
                        "application/json")
                };

                var response = await _httpClient.SendAsync(httpRequest);
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Ollama error {Status}: {Body}", response.StatusCode, body);
                    return fallback;
                }

                var ollamaResponse = await response.Content.ReadFromJsonAsync<OllamaResponse>(_jsonOptions);
                var reply = ollamaResponse?.Message?.Content?.Trim();

                if (string.IsNullOrWhiteSpace(reply))
                {
                    return fallback;
                }

                return new ChatResponseDto
                {
                    Reply = reply,
                    KnowledgeUsed = string.Empty,
                    UsedFallback = false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to reach Ollama");
                return fallback;
            }
        }

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        private sealed class OllamaResponse
        {
            public OllamaMessage Message { get; set; } = new();
        }

        private sealed class OllamaMessage
        {
            public string Role { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
        }
    }
}