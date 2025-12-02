import React from "react";
import "./Footer.css";
import { Icon } from "@iconify/react";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import { useCurrency } from "../../contexts/CurrencyContext";
import { useLanguageCurrencyModal } from "../../contexts/LanguageCurrencyModalContext";

export default function Footer() {
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const { openModal: openLanguageCurrency } = useLanguageCurrencyModal();

  return (
    <footer className="footer">

      {/* 4 columns */}
      <div className="footer-columns">
        {/* SUPPORT */}
        <div className="footer-col">
          <h4 className="footer-title">{t(language, "footer.support.title")}</h4>
          <a>{t(language, "footer.support.help")}</a>
          <a>{t(language, "footer.support.safety")}</a>
          <a>{t(language, "footer.support.cancel")}</a>
          <a>{t(language, "footer.support.covid")}</a>
          <a>{t(language, "footer.support.disabilities")}</a>
          <a>{t(language, "footer.support.neighborhood")}</a>
        </div>

        {/* COMMUNITY */}
        <div className="footer-col">
          <h4 className="footer-title">{t(language, "footer.community.title")}</h4>
          <a>{t(language, "footer.community.accessibility")}</a>
          <a>{t(language, "footer.community.discrimination")}</a>
          <a>{t(language, "footer.community.invite")}</a>
          <a>{t(language, "footer.community.giftcards")}</a>
          <a>{t(language, "footer.community.org")}</a>
        </div>

        {/* HOSTING */}
        <div className="footer-col">
          <h4 className="footer-title">{t(language, "footer.hosting.title")}</h4>
          <a>{t(language, "footer.hosting.try")}</a>
          <a>{t(language, "footer.hosting.aircover")}</a>
          <a>{t(language, "footer.hosting.resources")}</a>
          <a>{t(language, "footer.hosting.forum")}</a>
          <a>{t(language, "footer.hosting.responsible")}</a>
        </div>

        {/* ABOUT */}
        <div className="footer-col">
          <h4 className="footer-title">{t(language, "footer.about.title")}</h4>
          <a>{t(language, "footer.about.news")}</a>
          <a>{t(language, "footer.about.features")}</a>
          <a>{t(language, "footer.about.founders")}</a>
          <a>{t(language, "footer.about.careers")}</a>
          <a>{t(language, "footer.about.investors")}</a>
        </div>
      </div>

      {/* Kicker */}
      <div className="footer-kicker">
        <hr className="footer-line" />

        <div className="sub-footer">
          <div className="sub-left">
            <span>© 2025 UiTour, Inc.</span>
            <span className="dot" />
            <a>{t(language, "footer.legal.privacy")}</a>
            <span className="dot" />
            <a>{t(language, "footer.legal.terms")}</a>
            <span className="dot" />
            <a>{t(language, "footer.legal.sitemap")}</a>
          </div>

          <div className="sub-right">
            <div className="lang-currency">

              {/* 🌐 LANGUAGE BUTTON */}
              <button className="lang-button" onClick={openLanguageCurrency}>
                <Icon icon="mdi:earth" width="16" height="16" />
                {t(language, "footer.language")}
              </button>

              {/* 💰 CURRENCY BUTTON */}
              <button className="currency-button" onClick={openLanguageCurrency}>
                <span className="currency-symbol">
                  {currency === "USD" ? "$" : "₫"}
                </span>
                {currency}
              </button>
            </div>

            <div className="social">
              <a><Icon icon="mdi:facebook" width="20" height="20" /></a>
              <a><Icon icon="mdi:twitter" width="20" height="20" /></a>
              <a><Icon icon="mdi:instagram" width="20" height="20" /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
