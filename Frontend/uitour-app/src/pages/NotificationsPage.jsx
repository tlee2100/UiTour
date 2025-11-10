import './NotificationsPage.css';

export default function NotificationsPage() {
  return (
    <div className="notif">
      <h1 className="notif-title">Thông báo</h1>
      <div className="notif-empty">
        <div className="notif-icon">🔔</div>
        <div className="notif-text">Bạn chưa có thông báo nào.</div>
      </div>
    </div>
  );
}


