import { useState } from "react";
import { Icon } from "@iconify/react";
import { t } from "../utils/translations";
import { useLanguage } from "../contexts/LanguageContext";
import "./SupportPage.css";

export default function SupportPage() {
  const { language } = useLanguage();
  const supportHeroImage = "src/assets/support-hero.png";
  const [showContactCard, setShowContactCard] = useState(false);

  return (
    <div className="support-page">
      <section className="support-hero">
        <div className="support-hero_content">
          <p className="support-hero_kicker">{t(language, "support.kicker")}</p>
          <h1>{t(language, "support.title")}</h1>
          <p className="support-hero_description">{t(language, "support.description")}</p>
          <div className="support-hero_actions">
            <button className="support-primary" onClick={() => setShowContactCard((prev) => !prev)}>
              <Icon icon="mdi:lifebuoy" width="20" height="20" />
              <span>{t(language, "support.contactUs")}</span>
            </button>
          </div>
        </div>
        <div className="support-hero_graphic">
          {supportHeroImage ? (
            <img src={supportHeroImage} alt={t(language, "support.heroAlt")} />
          ) : (
            <div className="support-hero_illustration">
              <Icon icon="mdi:lifebuoy" width="60" height="60" />
              <p>{t(language, "support.heroIllustration")}</p>
            </div>
          )}
        </div>
      </section>

      {showContactCard && (
        <section className="support-contact-card">
          <div className="support-contact-item">
            <Icon icon="mdi:email" width="24" height="24" />
            <div>
              <p>{t(language, "support.emailLabel")}</p>
              <a href="mailto:support@uitour.com">support@uitour.com</a>
            </div>
          </div>
          <div className="support-contact-item">
            <Icon icon="mdi:phone" width="24" height="24" />
            <div>
              <p>{t(language, "support.hotlineLabel")}</p>
              <a href="tel:+1800123456">+1 800 123 456</a>
            </div>
          </div>
          <button
            className="support-chatbot-btn"
            onClick={() => window.dispatchEvent(new Event("uitour-open-chat"))}
          >
            <Icon icon="mdi:robot-happy-outline" width="20" height="20" />
            <span>{t(language, "support.chatbot")}</span>
          </button>
        </section>
      )}

      <section className="support-grid">
        {["support.section1", "support.section2", "support.section3"].map((key) => (
          <article className="support-card" key={key}>
            <h3>{t(language, `${key}.title`)}</h3>
            <p>{t(language, `${key}.content`)}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

