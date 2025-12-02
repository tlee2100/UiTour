using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class MessageHub : Hub
{
    // Trigger khi user kết nối
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var userId = httpContext?.Request.Query["userId"].ToString();

        if (!string.IsNullOrEmpty(userId))
        {
            // Group theo userId để gửi tin riêng
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

            // Thông báo user online (nếu muốn)
            await Clients.Group($"user_{userId}").SendAsync("UserConnected", userId);
        }

        await base.OnConnectedAsync();
    }

    // Trigger khi user ngắt kết nối
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var httpContext = Context.GetHttpContext();
        var userId = httpContext?.Request.Query["userId"].ToString();

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");

            // Thông báo user offline
            await Clients.Group($"user_{userId}").SendAsync("UserDisconnected", userId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Gửi tin nhắn từ user này đến user khác
    public async Task SendMessageToUser(string toUserId, string message)
    {
        await Clients.Group($"user_{toUserId}")
            .SendAsync("ReceiveMessage", message);
    }

    // Gửi tin nhắn đến tất cả client
    public async Task SendMessageToAll(string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", message);
    }

    // Gửi tin nhắn vào phòng (nếu dùng chat room)
    public async Task JoinRoom(string roomName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
    }

    public async Task LeaveRoom(string roomName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
    }

    public async Task SendToRoom(string roomName, string message)
    {
        await Clients.Group(roomName).SendAsync("ReceiveMessage", message);
    }
}
