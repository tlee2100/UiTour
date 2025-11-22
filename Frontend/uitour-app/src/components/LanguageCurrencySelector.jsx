import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { t } from '../utils/translations';
import './LanguageCurrencySelector.css';

export default function LanguageCurrencySelector({ isOpen, onClose, triggerRef }) {
  const { language, changeLanguage, languages } = useLanguage();
  const { currency, changeCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('language');
  const modalRef = useRef(null);

  const currentLang = language;

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    // Keep modal open to allow currency selection
  };

  const handleCurrencySelect = (cur) => {
    changeCurrency(cur);
    // Optionally close modal after selection
    // onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="language-currency-overlay" onClick={onClose}>
      <div className="language-currency-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="language-currency-header">
          <h2>{t(currentLang, 'language.title')}</h2>
          <button className="language-currency-close" onClick={onClose}>
            <Icon icon="mdi:close" width="24" height="24" />
          </button>
        </div>

        {/* Tabs */}
        <div className="language-currency-tabs">
          <button
            className={`language-currency-tab ${activeTab === 'language' ? 'active' : ''}`}
            onClick={() => setActiveTab('language')}
          >
            {t(currentLang, 'language.selectLanguage')}
          </button>
          <button
            className={`language-currency-tab ${activeTab === 'currency' ? 'active' : ''}`}
            onClick={() => setActiveTab('currency')}
          >
            {t(currentLang, 'currency.selectCurrency')}
          </button>
        </div>

        {/* Content */}
        <div className="language-currency-content">
          {activeTab === 'language' ? (
            <div className="language-currency-list">
              <button
                className={`language-currency-item ${language === 'en' ? 'selected' : ''}`}
                onClick={() => handleLanguageSelect('en')}
              >
                <div className="language-currency-item-content">
                  <span className="language-currency-item-name">{languages.en.nativeName}</span>
                  <span className="language-currency-item-subtitle">{languages.en.name}</span>
                </div>
                {language === 'en' && (
                  <Icon icon="mdi:check" width="24" height="24" className="language-currency-check" />
                )}
              </button>
              <button
                className={`language-currency-item ${language === 'vi' ? 'selected' : ''}`}
                onClick={() => handleLanguageSelect('vi')}
              >
                <div className="language-currency-item-content">
                  <span className="language-currency-item-name">{languages.vi.nativeName}</span>
                  <span className="language-currency-item-subtitle">{languages.vi.name}</span>
                </div>
                {language === 'vi' && (
                  <Icon icon="mdi:check" width="24" height="24" className="language-currency-check" />
                )}
              </button>
            </div>
          ) : (
            <div className="language-currency-list">
              <button
                className={`language-currency-item ${currency === 'USD' ? 'selected' : ''}`}
                onClick={() => handleCurrencySelect('USD')}
              >
                <div className="language-currency-item-content">
                  <span className="language-currency-item-name">USD - {t(currentLang, 'currency.usd')}</span>
                  <span className="language-currency-item-subtitle">$</span>
                </div>
                {currency === 'USD' && (
                  <Icon icon="mdi:check" width="24" height="24" className="language-currency-check" />
                )}
              </button>
              <button
                className={`language-currency-item ${currency === 'VND' ? 'selected' : ''}`}
                onClick={() => handleCurrencySelect('VND')}
              >
                <div className="language-currency-item-content">
                  <span className="language-currency-item-name">VND - {t(currentLang, 'currency.vnd')}</span>
                  <span className="language-currency-item-subtitle">₫</span>
                </div>
                {currency === 'VND' && (
                  <Icon icon="mdi:check" width="24" height="24" className="language-currency-check" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

