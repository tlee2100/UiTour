import SvgIcon from "../../components/SvgIcon";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateAmenities() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const amenities = stayData.amenities || [];

  const amenitiesList = [
    { id: "1", label: "Wi-Fi", icon: "amen_wifi" },
    { id: "7", label: "TV", icon: "amen_tv" },
    { id: "6", label: "Air conditioning", icon: "amen_ac" },
    { id: "8", label: "Kitchen", icon: "amen_kitchen" },
    { id: "2", label: "Washer", icon: "amen_washer" },
    { id: "15", label: "Dryer", icon: "amen_dryer" },
    { id: "3", label: "Heating", icon: "amen_heating" },
    { id: "4", label: "Iron", icon: "amen_iron" },
    { id: "9", label: "Gym", icon: "amen_gym" },
    { id: "11", label: "Free parking", icon: "amen_free_parking" },
    { id: "17", label: "Hot tub", icon: "amen_hottub" },
    { id: "14", label: "Pool", icon: "amen_pool" },
    { id: "19", label: "BBQ grill", icon: "amen_bbq" },
    { id: "18", label: "EV charger", icon: "amen_ev_charger" },
    { id: "13", label: "Smoke alarm", icon: "amen_smoke_alarm" },
    { id: "12", label: "Breakfast", icon: "amen_breakfast" },
    { id: "10", label: "Dedicated Workspace", icon: "amen_workspace" },
    { id: "5", label: "King bed", icon: "amen_king_bed" },
    { id: "16", label: "Hair dryer", icon: "amen_hair_dryer" }
  ];

  const toggleAmenity = (id) => {
    const amenityId = Number(id); // ✅ convert sang số
    const newAmenities = amenities.includes(amenityId)
      ? amenities.filter((i) => i !== amenityId)
      : [...amenities, amenityId];
    updateField("amenities", { amenities: newAmenities });
    Console.log(newAmenities);
  };

  const handleNext = () => {
    if (!validateStep("amenities")) return;
    navigate("/host/stay/create/photos");
  };

  return (
    <div className="hs-page">
      <main className="hs-main">
        <h1 className="hs-title">What amenities does your place have?</h1>
        <div className="hs-amenities-grid">
          {amenitiesList.map((a) => (
            <button
              key={a.id}
              className={`hs-amenity-card ${amenities.includes(Number(a.id)) ? "is-selected" : ""}`}
              onClick={() => toggleAmenity(a.id)}
              type="button"
            >
              <div className="hs-amenity-inner">
                <SvgIcon name={a.icon} className="hs-icon" />
                <div className="hs-amenity-label">{a.label}</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
