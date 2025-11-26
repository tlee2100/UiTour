import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./BecomeHost.css";
import houselogo from "../assets/UiTourHouse.png";
import experienelogo from "../assets/UiTourExperience.png";

import { useLanguage } from "../contexts/LanguageContext";
import { t } from "../utils/translations";

export default function BecomeHost() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="become-host">
      <button
        className="bh-back-button"
        onClick={() => navigate(-1)}
        aria-label={t(language, "becomeHost.back")}
      >
        <Icon icon="mdi:arrow-left" width="20" height="20" />
        {t(language, "becomeHost.back")}
      </button>

      <div className="bh-container">
        <h1 className="bh-title">
          {t(language, "becomeHost.title")}
        </h1>

        <div className="bh-options">
          {/* Stay */}
          <button
            className="bh-card"
            onClick={() => navigate("/host/stay/create/choose")}
          >
            <div className="bh-image">
              <img src={houselogo} alt={t(language, "becomeHost.homeAlt")} />
            </div>
            <div className="bh-label">
              {t(language, "becomeHost.home")}
            </div>
          </button>

          {/* Experience */}
          <button
            className="bh-card"
            onClick={() => navigate("/host/experience/create/choose")}
          >
            <div className="bh-image">
              <img src={experienelogo} alt={t(language, "becomeHost.experienceAlt")} />
            </div>
            <div className="bh-label">
              {t(language, "becomeHost.experience")}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
