import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateDescription() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const description = stayData.description || "";
  const summary = stayData.summary || "";

  const handleChange = (e) => {
    updateField("description", { description: e.target.value, summary: e.target.value });
  };

  const handleNext = () => {
    if (!validateStep("description")) return;
    navigate("/host/stay/create/weekday-price");
  };

  return (
    <div className="hs-page">
      <main className="hs-desc-main">
        <h1 className="hs-desc-heading">Create your description</h1>
        <div className="hs-desc-box">
          <textarea
            className="hs-desc-input"
            placeholder="The whole group will be comfortable in this spacious and unique space."
            value={description}
            maxLength={70}
            onChange={handleChange}
          />
          <div className="hs-desc-count">{description.length}/70</div>
        </div>
      </main>
    </div>
  );
}
