import './admin.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';

export default function AdminSettings() {
  const { language } = useLanguage();

  return (
    <div className="admin-page">
      <div className="grid-3">
        <div className="settings-card">
          <div className="settings-title">{t(language, 'adminSettings.categoryTitle')}</div>
          <div className="settings-row">
            <label>{t(language, 'adminSettings.roomType')}</label>
            <input placeholder="Villa" />
          </div>
          <div className="settings-row">
            <label>{t(language, 'adminSettings.tourType')}</label>
            <input placeholder="Beach travel" />
          </div>
          <div className="settings-row">
            <label>{t(language, 'adminSettings.location')}</label>
            <input placeholder="Hanoi" />
          </div>
        </div>
        <div className="settings-card">
          <div className="settings-title">{t(language, 'adminSettings.feeTitle')}</div>
          <div className="settings-row">
            <label>{t(language, 'adminSettings.serviceFee')}</label>
            <input defaultValue="7" />
          </div>
          <div className="settings-row">
            <label>{t(language, 'adminSettings.vat')}</label>
            <input defaultValue="10" />
          </div>
          <button className="primary small">{t(language, 'adminSettings.saveChanges')}</button>
        </div>
        <div className="settings-card">
          <div className="settings-title">{t(language, 'adminSettings.bannerTitle')}</div>
          <div className="banner-item">Tet 2025 Banner</div>
          <button className="ghost small">{t(language, 'adminSettings.addBanner')}</button>
        </div>
      </div>
    </div>
  );
}


