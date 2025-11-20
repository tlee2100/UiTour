import { useState } from 'react';
import './admin.css';

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Mock data - replace with API call when backend is ready
  const rows = [
    { id: 1, reporter: 'Nguyễn Văn An', target: 'Villa sang trọng tại Đà Lạt', reason: 'Spam content', date: '25/12/2024', state: 'MỚI' },
    { id: 2, reporter: 'Lê Hoàng Cường', target: 'Villa cao cấp tại Đà Nẵng', reason: 'Spam content', date: '22/12/2024', state: 'ĐANG XỬ LÝ' },
  ];

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const handleResolve = () => {
    if (selectedReport) {
      alert(`Đã giải quyết báo cáo #${selectedReport.id}`);
      setSelectedReport(null);
    }
  };

  const handleMarkProcessing = () => {
    if (selectedReport) {
      alert(`Đã đánh dấu báo cáo #${selectedReport.id} là đang xử lý`);
    }
  };

  return (
    <div className="admin-page admin-split">
      <div className="table-card">
        <div className="table-title">Danh sách báo cáo</div>
        <div className="table">
          <div className="row head"><div>ID</div><div>Người báo cáo</div><div>Đối tượng</div><div>Lý do</div><div>Ngày</div><div>Trạng thái</div></div>
          {rows.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Không có báo cáo</div>
          ) : (
            rows.map(r => (
              <div 
                key={r.id} 
                className="row" 
                onClick={() => handleSelectReport(r)}
                style={{ cursor: 'pointer', backgroundColor: selectedReport?.id === r.id ? '#f5f5f5' : 'transparent' }}
              >
                <div>{r.id}</div>
                <div>{r.reporter}</div>
                <div>{r.target}</div>
                <div>{r.reason}</div>
                <div>{r.date}</div>
                <div>{r.state}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <aside className="detail-card">
        <div className="table-title">Chi tiết báo cáo</div>
        <div className="detail-body">
          {selectedReport ? (
            <div>
              <p><strong>ID:</strong> #{selectedReport.id}</p>
              <p><strong>Người báo cáo:</strong> {selectedReport.reporter}</p>
              <p><strong>Đối tượng:</strong> {selectedReport.target}</p>
              <p><strong>Lý do:</strong> {selectedReport.reason}</p>
              <p><strong>Ngày:</strong> {selectedReport.date}</p>
              <p><strong>Trạng thái:</strong> {selectedReport.state}</p>
            </div>
          ) : (
            <div style={{ color: '#666' }}>Chọn một báo cáo để xem chi tiết</div>
          )}
        </div>
        <div className="button-row">
          <button className="primary" onClick={handleResolve} disabled={!selectedReport}>
            Giải quyết báo cáo
          </button>
          <button className="ghost" onClick={handleMarkProcessing} disabled={!selectedReport}>
            Đánh dấu đang xử lý
          </button>
        </div>
      </aside>
    </div>
  );
}


