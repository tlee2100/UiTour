import { useNavigate } from "react-router-dom";
import { useHost } from "../../contexts/HostContext";
import "./HostStay.css";

export default function HostStayCreateTitle() {
  const navigate = useNavigate();
  const { stayData, updateField, validateStep } = useHost();
  const title = stayData.title || "";

  const handleChange = (e) => {
    updateField("title", { title: e.target.value });
  };

  const handleNext = () => {
    if (!validateStep("title")) return;
    navigate("/host/stay/create/description");
  };

  return (
    <div className="hs-page">
      <main className="hs-title-main">
        <h1 className="hs-title-heading">Now, let’s give your house a title</h1>
        <div className="hs-title-box">
          <textarea
            className="hs-title-input"
            placeholder="Write something..."
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
