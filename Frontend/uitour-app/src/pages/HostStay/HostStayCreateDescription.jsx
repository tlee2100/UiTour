import { useNavigate } from "react-router-dom";
import "./HostStay.css";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";

export default function HostStayCreateDescription() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const { language } = useLanguage();

  const description = stayData.description || "";

  const handleChange = (e) => {
    updateField("description", {
      description: e.target.value,
      summary: e.target.value,
    });
  };

  const handleNext = () => {
    if (!validateStep("description")) return;
    navigate("/host/stay/create/weekday-price");
  };

  return (
    <div className="hs-page">
      <main className="hs-desc-main">

        <h1 className="hs-desc-heading">
          {t(language, "hostStay.description.title")}
        </h1>

        <div className="hs-desc-box">
          <textarea
            className="hs-desc-input"
            placeholder={t(language, "hostStay.description.placeholder")}
            value={description}
            maxLength={70}
            onChange={handleChange}
          />

          <div className="hs-desc-count">
            {t(language, "hostStay.description.count").replace("{{count}}", description.length)}
          </div>
        </div>

      </main>
    </div>
  );
}
