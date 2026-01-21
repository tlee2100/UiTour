UiTour - Website Quảng Bá Du Lịch và Đặt Phòng
UiTour là một nền tảng trực tuyến toàn diện kết nối người dùng với các dịch vụ lưu trú và trải nghiệm du lịch. Hệ thống hỗ trợ quản lý quy trình từ đăng tin, tìm kiếm, đặt chỗ cho đến thanh toán và đánh giá.

📌 Tính năng chính
Hệ thống được thiết kế với 3 tác nhân chính, mỗi tác nhân có bộ chức năng riêng biệt:

👤 Khách hàng (User)
- Quản lý tài khoản: Đăng ký, đăng nhập và cập nhật hồ sơ cá nhân.

- Tìm kiếm thông minh: Tìm kiếm chỗ ở và tour theo vị trí, giá cả và thời gian.

- Đặt chỗ & Thanh toán: Đặt phòng/tour và thanh toán trực tuyến qua các phương thức hỗ trợ.

- Tương tác: Lưu yêu thích, viết đánh giá và gửi yêu cầu hỗ trợ.

🏠 Chủ nhà / Nhà cung cấp (Host)
- Quản lý chỗ ở: Tạo mới, tải ảnh, quản lý tiện nghi và loại phòng.

- Quản lý Tour: Khởi tạo tour, thiết lập lịch trình chi tiết và giá cả.

- Vận hành: Cập nhật thông tin và theo dõi trạng thái bài đăng.

🛡️ Quản trị viên (Admin)
- Quản lý người dùng: Kiểm soát danh sách, khóa/mở khóa tài khoản vi phạm.

- Kiểm duyệt nội dung: Phê duyệt bài đăng mới, ẩn hoặc xóa các nội dung vi phạm.

- Xử lý phản hồi: Tiếp nhận báo cáo vi phạm, đánh giá mức độ và phản hồi cho các bên.

🛠 Công nghệ sử dụng
- Backend: .NET (ASP.NET Core)

- Frontend: React/Vite (dựa trên cấu trúc npm)

- Database: Microsoft SQL Server

- Bảo mật: Mã hóa mật khẩu và dữ liệu thanh toán.
⚙️ Hướng dẫn cài đặt
1. Cài đặt và chạy Backend
   
Yêu cầu: .NET SDK và SQL Server Management Studio (SSMS).
- Clone repository

- Thiết lập cơ sở dữ liệu: Mở SQL Management Studio và thực thi file script.sql để tạo database.

- Cấu hình Secrets: chạy lệnh "dotnet user-secrets init" và set secrets theo appsettings.example.json

- Chạy ứng dụng: chạy "dotnet run"

2. Cài đặt và chạy Frontend
- Chạy lệnh "npm install" để cài đặt thư viện

- Chạy lệnh "npm run dev"
