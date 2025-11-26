import { useNavigate } from "react-router-dom";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostStayCreateTitle() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const { language } = useLanguage();

  const title = stayData.listingTitle || "";

  const handleChange = (e) => {
    updateField("title", { listingTitle: e.target.value });
  };

  const handleNext = () => {
    if (!validateStep("title")) return;
    navigate("/host/stay/create/description");
  };

  return (
    <div className="hs-page">
      <main className="hs-title-main">
        <h1 className="hs-title-heading">
          {t(language, "hostStay.title.heading")}
        </h1>

        <div className="hs-title-box">
          <textarea
            className="hs-title-input"
            placeholder={t(language, "hostStay.title.placeholder")}
            value={title}
            maxLength={50}
            onChange={handleChange}
          />
          <div className="hs-title-count">{title.length}/50</div>
        </div>
      </main>
    </div>
  );
}
