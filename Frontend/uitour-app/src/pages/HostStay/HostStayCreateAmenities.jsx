import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SvgIcon from "../../components/SvgIcon";
import logo from "../../assets/UiTour.png";
import "./HostStay.css";

export default function HostStayCreateAmenities() {
    const navigate = useNavigate();

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
        { id: "hair_dryer", label: "Hair dryer", icon: "amen_hair_dryer" },
    ];

    const [selected, setSelected] = useState([]);

    const toggleAmenity = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        console.log("Selected amenities:", selected);
        navigate("/host/stay/create/photos");
    };

    return (
        <div className="hs-page">
            {/* ===== HEADER ===== */}
            <header className="hs-header">
                <img
                    src={logo}
                    alt="UiTour Logo"
                    className="hs-logo"
                    onClick={() => navigate("/")}
                />
                <button className="hs-save-btn">Save & Exit</button>
            </header>

            {/* ===== MAIN ===== */}
            <main className="hs-main">
                <h1 className="hs-title">What amenities does your place have?</h1>

                <div className="hs-amenities-grid">
                    {amenitiesList.map((a) => (
                        <button
                            key={a.id}
                            className={`hs-amenity-card ${selected.includes(a.id) ? "is-selected" : ""
                                }`}
                            onClick={() => toggleAmenity(a.id)}
                        >
                            <div className="hs-amenity-inner">
                                <SvgIcon name={a.icon} className="hs-icon" />
                                <div className="hs-amenity-label">{a.label}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            {/* ===== FOOTER ===== */}
            <footer className="hs-footer">
                <button
                    className="hs-footer-btn hs-footer-btn--white"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
                <button
                    className="hs-footer-btn hs-footer-btn--black"
                    onClick={handleNext}
                    disabled={selected.length === 0}
                >
                    Next
                </button>
            </footer>
        </div>
    );
}
