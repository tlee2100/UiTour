import './AccountSettingsPage.css';

export default function AccountSettingsPage() {
  return (
    <div className="acct">
      <h1 className="acct-title">Cài đặt tài khoản</h1>
      <div className="acct-layout">
        <aside className="acct-sidebar">
          <button className="acct-item active">Thông tin cá nhân</button>
          <button className="acct-item">Đăng nhập và bảo mật</button>
          <button className="acct-item">Quyền riêng tư</button>
          <button className="acct-item">Thông báo</button>
          <button className="acct-item">Thuế</button>
          <button className="acct-item">Thanh toán</button>
          <button className="acct-item">Ngôn ngữ và loại tiền tệ</button>
          <button className="acct-item">Đi công tác</button>
        </aside>
        <main className="acct-main">
          <h2 className="acct-section-title">Thông tin cá nhân</h2>
          <div className="acct-field">
            <div className="acct-field-label">Tên pháp lý</div>
            <div className="acct-field-value">Tân Lê</div>
            <button className="acct-link">Chỉnh sửa</button>
          </div>
          <div className="acct-field">
            <div className="acct-field-label">Địa chỉ email</div>
            <div className="acct-field-value">l***5@gmail.com</div>
            <button className="acct-link">Chỉnh sửa</button>
          </div>
          <div className="acct-field">
            <div className="acct-field-label">Số điện thoại</div>
            <div className="acct-field-value">Chưa cung cấp</div>
            <button className="acct-link">Thêm</button>
          </div>
          <div className="acct-field">
            <div className="acct-field-label">Xác minh danh tính</div>
            <div className="acct-field-value">Chưa bắt đầu</div>
            <button className="acct-link">Bắt đầu</button>
          </div>
          <div className="acct-field">
            <div className="acct-field-label">Địa chỉ cư trú</div>
            <div className="acct-field-value">Chưa cung cấp</div>
            <button className="acct-link">Thêm</button>
          </div>
        </main>
      </div>
    </div>
  );
}


