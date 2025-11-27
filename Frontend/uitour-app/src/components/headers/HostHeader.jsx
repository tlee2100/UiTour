import "./HostHeader.css";
import logo from "../../assets/UiTour.png";
import { useNavigate } from "react-router-dom";

export default function HostHeader() {
  const navigate = useNavigate();

  return (
    <header className="hheader">
      <button
        className="hheader-logoButton"
        onClick={() => navigate("/")}
        aria-label="UiTour"
      >
        <img src={logo} alt="UiTour Logo" className="hheader-logo-image" />
      </button>
    </header>
  );
}
