import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';
import './MembershipModal.css';

export default function MembershipModal({ isOpen, onClose }) {
  const { tripCount } = useApp();
  const { language } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine tier and progress
  const getTierInfo = () => {
    if (tripCount >= 1 && tripCount <= 5) {
      return {
        tier: 'bronze',
        current: tripCount,
        target: 5,
        nextTier: 'silver',
        benefits: [
          t(language, 'membership.benefits.bronze.discount'),
          t(language, 'membership.benefits.bronze.support')
        ]
      };
    } else if (tripCount >= 6 && tripCount <= 10) {
      return {
        tier: 'silver',
        current: tripCount,
        target: 10,
        nextTier: 'gold',
        benefits: [
          t(language, 'membership.benefits.silver.discount'),
          t(language, 'membership.benefits.silver.support'),
          t(language, 'membership.benefits.silver.cancellation')
        ]
      };
    } else {
      return {
        tier: 'gold',
        current: tripCount,
        target: 15,
        nextTier: null,
        benefits: [
          t(language, 'membership.benefits.gold.discount'),
          t(language, 'membership.benefits.gold.support'),
          t(language, 'membership.benefits.gold.cancellation'),
          t(language, 'membership.benefits.gold.upgrade')
        ]
      };
    }
  };

  const tierInfo = getTierInfo();
  const progress = Math.min((tierInfo.current / tierInfo.target) * 100, 100);
  const tripsRemaining = Math.max(0, tierInfo.target - tierInfo.current);
  const isMaxTier = tierInfo.tier === 'gold' && tripCount >= 15;

  return (
    <div className="membership-modal-overlay" onClick={onClose}>
      <div className="membership-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`membership-modal-header membership-modal-header_${tierInfo.tier}`}>
          <div className="membership-header-content">
            <div className={`membership-badge-icon membership-badge-icon_${tierInfo.tier}`}>
              <Icon icon="mdi:medal" width="24" height="24" />
            </div>
            <div className="membership-header-text">
              <h2 className="membership-tier-title">
                {t(language, `membership.tier.${tierInfo.tier}`)}
              </h2>
              <p className="membership-status-label">
                {t(language, 'membership.statusLabel')}
              </p>
            </div>
          </div>
          <button className="membership-modal-close" onClick={onClose} aria-label="Close">
            <Icon icon="mdi:close" width="20" height="20" />
          </button>
        </div>

        {/* Content */}
        <div className="membership-modal-content">
          {/* Trip Count */}
          <div className="membership-trip-count">
            <Icon icon="mdi:trending-up" width="16" height="16" />
            <span>
              <strong>{tierInfo.current}</strong> {t(language, 'membership.tripsBooked')}
            </span>
          </div>

          {/* Progress */}
          <div className="membership-progress-section">
            <div className="membership-progress-label">
              <span>{t(language, 'membership.progress')}</span>
              <span className="membership-progress-text">
                {tierInfo.current}/{tierInfo.target} {t(language, 'membership.trips')}
              </span>
            </div>
            <div className="membership-progress-bar">
              <div 
                className={`membership-progress-fill membership-progress-fill_${tierInfo.tier}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Next Tier Message */}
          {isMaxTier ? (
            <div className="membership-achievement-message">
              <Icon icon="mdi:party-popper" width="20" height="20" />
              <span>{t(language, 'membership.maxTierMessage')}</span>
            </div>
          ) : (
            <div className="membership-next-tier-message">
              {t(language, 'membership.nextTierMessage', {
                trips: tripsRemaining,
                tier: t(language, `membership.tier.${tierInfo.nextTier}`)
              })}
            </div>
          )}

          {/* Benefits */}
          <div className="membership-benefits-section">
            <h3 className="membership-benefits-title">
              {t(language, 'membership.benefitsTitle')}
            </h3>
            <ul className="membership-benefits-list">
              {tierInfo.benefits.map((benefit, index) => (
                <li key={index} className="membership-benefit-item">
                  <Icon icon="mdi:check-circle" width="20" height="20" className="membership-check-icon" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

