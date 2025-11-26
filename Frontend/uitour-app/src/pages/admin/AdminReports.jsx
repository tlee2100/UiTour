import { useState } from 'react';
import './admin.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const { language } = useLanguage();
  
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
        <div className="table-title">{t(language, 'adminReports.title')}</div>
        <div className="table">
          <div className="row head">
            <div>ID</div>
            <div>{t(language, 'adminReports.reporter')}</div>
            <div>{t(language, 'adminReports.target')}</div>
            <div>{t(language, 'adminReports.reason')}</div>
            <div>{t(language, 'adminReports.date')}</div>
            <div>{t(language, 'adminReports.status')}</div>
          </div>
          {rows.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>{t(language, 'common.noData')}</div>
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
        <div className="table-title">{t(language, 'adminReports.detailTitle')}</div>
        <div className="detail-body">
          {selectedReport ? (
            <div>
              <p><strong>ID:</strong> #{selectedReport.id}</p>
              <p><strong>{t(language, 'adminReports.reporter')}:</strong> {selectedReport.reporter}</p>
              <p><strong>{t(language, 'adminReports.target')}:</strong> {selectedReport.target}</p>
              <p><strong>{t(language, 'adminReports.reason')}:</strong> {selectedReport.reason}</p>
              <p><strong>{t(language, 'adminReports.date')}:</strong> {selectedReport.date}</p>
              <p><strong>{t(language, 'adminReports.status')}:</strong> {selectedReport.state}</p>
            </div>
          ) : (
            <div style={{ color: '#666' }}>{t(language, 'adminReports.selectPrompt')}</div>
          )}
        </div>
        <div className="button-row">
          <button className="primary" onClick={handleResolve} disabled={!selectedReport}>
            {t(language, 'adminReports.resolve')}
          </button>
          <button className="ghost" onClick={handleMarkProcessing} disabled={!selectedReport}>
            {t(language, 'adminReports.markProcessing')}
          </button>
        </div>
      </aside>
    </div>
  );
}


