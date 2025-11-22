import './NotificationsPage.css';

export default function NotificationsPage() {
  return (
    <div className="notif">
      <h1 className="notif-title">Notifications</h1>
      <div className="notif-empty">
        <div className="notif-icon">🔔</div>
        <div className="notif-text">You have no notifications yet.</div>
      </div>
    </div>
  );
}


