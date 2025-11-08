import { useNavigate } from "react-router-dom";
import "./BecomeHost.css";
import houselogo from "../assets/UiTourHouse.png";
import experienelogo from "../assets/UiTourExperience.png";

export default function BecomeHost() {
  const navigate = useNavigate();

  return (
    <div className="become-host">
      <div className="bh-container">
        <h1 className="bh-title">What would you like to host?</h1>

        <div className="bh-options">
          {/* Nơi lưu trú */}
          <button
            className="bh-card"
            onClick={() => navigate("/host/stay/create/choose")}
          >
            <div className="bh-image">
              <img
                src={houselogo}
                alt="Nơi lưu trú"
              />
            </div>
            <div className="bh-label">Home</div>
          </button>

          {/* Trải nghiệm */}
          <button
            className="bh-card"
            onClick={() => navigate("/host/experience/create/choose")}
          >
            <div className="bh-image">
              <img
                src={experienelogo}
                alt="Trải nghiệm"
              />
            </div>
            <div className="bh-label">Experience</div>
          </button>
        </div>
      </div>
    </div>
  );
}
