import './admin.css';

export default function AdminDashboard() {
  return (
    <div className="admin-page">
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-title">Tổng người dùng</div><div className="kpi-value">2,847</div></div>
        <div className="kpi-card"><div className="kpi-title">Bài đăng chờ duyệt</div><div className="kpi-value">23</div></div>
        <div className="kpi-card"><div className="kpi-title">Doanh thu tháng này</div><div className="kpi-value">₫45.2M</div></div>
        <div className="kpi-card"><div className="kpi-title">Báo cáo chưa xử lý</div><div className="kpi-value">7</div></div>
      </div>
      <div className="chart-grid">
        <div className="chart-card">Doanh thu theo tháng (mock)</div>
        <div className="chart-card">Tăng trưởng người dùng (mock)</div>
      </div>
      <div className="table-card">
        <div className="table-title">Báo cáo mới nhất</div>
        <div className="table">
          <div className="row head"><div>ID</div><div>Người báo cáo</div><div>Lý do</div><div>Ngày</div><div>Trạng thái</div></div>
          <div className="row"><div>#001</div><div>Nguyễn Văn A</div><div>Spam content</div><div>25/12/2024</div><div>Chờ xử lý</div></div>
          <div className="row"><div>#002</div><div>Trần Thị B</div><div>Giá không đúng</div><div>24/12/2024</div><div>Mới</div></div>
        </div>
      </div>
    </div>
  );
}


