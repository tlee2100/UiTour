import './NotificationsPage.css';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export default function NotificationsPage() {
  const { language } = useLanguage();

  return (
    <div className="notif">
      <h1 className="notif-title">
        {t(language, "homeNotifications.title")}
      </h1>

      <div className="notif-empty">
        <div className="notif-icon">🔔</div>

        <div className="notif-text">
          {t(language, "homeNotifications.empty")}
        </div>
      </div>
    </div>
  );
}
