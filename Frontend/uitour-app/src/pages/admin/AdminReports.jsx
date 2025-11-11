import './admin.css';

export default function AdminReports() {
  const rows = [
    { id: 1, reporter: 'Nguyễn Văn An', target: 'Villa sang trọng tại Đà Lạt', reason: 'Spam content', date: '25/12/2024', state: 'MỚI' },
    { id: 2, reporter: 'Lê Hoàng Cường', target: 'Villa cao cấp tại Đà Nẵng', reason: 'Spam content', date: '22/12/2024', state: 'ĐANG XỬ LÝ' },
  ];
  return (
    <div className="admin-page admin-split">
      <div className="table-card">
        <div className="table-title">Danh sách báo cáo</div>
        <div className="table">
          <div className="row head"><div>ID</div><div>Người báo cáo</div><div>Đối tượng</div><div>Lý do</div><div>Ngày</div><div>Trạng thái</div></div>
          {rows.map(r => (
            <div key={r.id} className="row"><div>{r.id}</div><div>{r.reporter}</div><div>{r.target}</div><div>{r.reason}</div><div>{r.date}</div><div>{r.state}</div></div>
          ))}
        </div>
      </div>
      <aside className="detail-card">
        <div className="table-title">Chi tiết báo cáo</div>
        <div className="detail-body">
          <div>...</div>
        </div>
        <div className="button-row">
          <button className="primary">Giải quyết báo cáo</button>
          <button className="ghost">Đánh dấu đang xử lý</button>
        </div>
      </aside>
    </div>
  );
}


