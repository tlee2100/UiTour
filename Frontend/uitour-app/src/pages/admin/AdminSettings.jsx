import './admin.css';

export default function AdminSettings() {
  return (
    <div className="admin-page">
      <div className="grid-3">
        <div className="settings-card">
          <div className="settings-title">Quản lý danh mục</div>
          <div className="settings-row">
            <label>Loại phòng</label>
            <input placeholder="Villa" />
          </div>
          <div className="settings-row">
            <label>Loại tour</label>
            <input placeholder="Du lịch biển" />
          </div>
          <div className="settings-row">
            <label>Địa điểm</label>
            <input placeholder="Hà Nội" />
          </div>
        </div>
        <div className="settings-card">
          <div className="settings-title">Quản lý phí dịch vụ (%)</div>
          <div className="settings-row">
            <label>Phí dịch vụ (%)</label>
            <input defaultValue="7" />
          </div>
          <div className="settings-row">
            <label>Thuế VAT (%)</label>
            <input defaultValue="10" />
          </div>
          <button className="primary small">Lưu thay đổi</button>
        </div>
        <div className="settings-card">
          <div className="settings-title">Banner & sự kiện</div>
          <div className="banner-item">Banner Tết 2025</div>
          <button className="ghost small">+ Thêm banner mới</button>
        </div>
      </div>
    </div>
  );
}


