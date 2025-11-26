import SvgIcon from "../../components/SvgIcon";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { t } from "../../utils/translations";
import "./HostStay.css";

export default function HostStayCreateAmenities() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const { language } = useLanguage();

  const amenities = stayData.amenities || [];

  const amenitiesList = [
    { id: 1, tKey: "wifi", icon: "amen_wifi" },
    { id: 7, tKey: "tv", icon: "amen_tv" },
    { id: 6, tKey: "ac", icon: "amen_ac" },
    { id: 8, tKey: "kitchen", icon: "amen_kitchen" },
    { id: 2, tKey: "washer", icon: "amen_washer" },
    { id: 15, tKey: "dryer", icon: "amen_dryer" },
    { id: 3, tKey: "heating", icon: "amen_heating" },
    { id: 4, tKey: "iron", icon: "amen_iron" },
    { id: 9, tKey: "gym", icon: "amen_gym" },
    { id: 11, tKey: "freeParking", icon: "amen_free_parking" },
    { id: 17, tKey: "hotTub", icon: "amen_hottub" },
    { id: 14, tKey: "pool", icon: "amen_pool" },
    { id: 19, tKey: "bbq", icon: "amen_bbq" },
    { id: 18, tKey: "evCharger", icon: "amen_ev_charger" },
    { id: 13, tKey: "smokeAlarm", icon: "amen_smoke_alarm" },
    { id: 12, tKey: "breakfast", icon: "amen_breakfast" },
    { id: 10, tKey: "workspace", icon: "amen_workspace" },
    { id: 5, tKey: "kingBed", icon: "amen_king_bed" },
    { id: 16, tKey: "hairDryer", icon: "amen_hair_dryer" }
  ];

  const toggleAmenity = (id) => {
    const newId = Number(id);
    const updated = amenities.includes(newId)
      ? amenities.filter((a) => a !== newId)
      : [...amenities, newId];

    updateField("amenities", updated);
  };

  const handleNext = () => {
    if (!validateStep("amenities")) return;
    navigate("/host/stay/create/photos");
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">
          {t(language, "hostStay.amenities.title")}
        </h1>

        <div className="hs-amenities-grid">
          {amenitiesList.map((a) => (
            <button
              key={a.id}
              className={`hs-amenity-card ${
                amenities.includes(a.id) ? "is-selected" : ""
              }`}
              onClick={() => toggleAmenity(a.id)}
              type="button"
            >
              <div className="hs-amenity-inner">
                <SvgIcon name={a.icon} className="hs-icon" />
                <div className="hs-amenity-label">
                  {t(language, `hostStay.amenities.${a.tKey}`)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
