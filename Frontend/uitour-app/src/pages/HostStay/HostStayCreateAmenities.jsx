import SvgIcon from "../../components/SvgIcon";
import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateAmenities() {
    const navigate = useNavigate();
    const { stayData, updateField, validateStep } = useHost();
    const amenities = stayData.amenities || [];

    const amenitiesList = [
        { id: "wifi", label: "Wi-Fi", icon: "amen_wifi" },
        { id: "tv", label: "TV", icon: "amen_tv" },
        { id: "ac", label: "Air conditioning", icon: "amen_ac" },
        { id: "kitchen", label: "Kitchen", icon: "amen_kitchen" },
        { id: "washer", label: "Washer", icon: "amen_washer" },
        { id: "dryer", label: "Dryer", icon: "amen_dryer" },
        { id: "heating", label: "Heating", icon: "amen_heating" },
        { id: "iron", label: "Iron", icon: "amen_iron" },
        { id: "gym", label: "Gym", icon: "amen_gym" },
        { id: "parking", label: "Free parking", icon: "amen_free_parking" },
        { id: "hot_tub", label: "Hot tub", icon: "amen_hottub" },
        { id: "pool", label: "Pool", icon: "amen_pool" },
        { id: "bbq", label: "BBQ grill", icon: "amen_bbq" },
        { id: "ev", label: "EV charger", icon: "amen_ev_charger" },
        { id: "smoke_alarm", label: "Smoke alarm", icon: "amen_smoke_alarm" },
        { id: "breakfast", label: "Breakfast", icon: "amen_breakfast" },
        { id: "workspace", label: "Workspace", icon: "amen_workspace" },
        { id: "king_bed", label: "King bed", icon: "amen_king_bed" },
        { id: "hair_dryer", label: "Hair dryer", icon: "amen_hair_dryer" }
    ];

    const toggleAmenity = (id) => {
        const newAmenities = amenities.includes(id)
            ? amenities.filter((i) => i !== id)
            : [...amenities, id];
        updateField("amenities", { amenities: newAmenities });
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
                            className={`hs-amenity-card ${amenities.includes(a.id) ? "is-selected" : ""}`}
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
