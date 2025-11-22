import React from "react";
import { useHost } from "../contexts/HostContext";
import { useNavigate } from "react-router-dom";

export default function HostDemoPreview() {
  const {
    stayData,
    experienceData,
    getFinalData,
    sendHostData,
    reset,
    setStayData,
    setExperienceData,
    getDebugData,
  } = useHost();

  const navigate = useNavigate();
  const debug = getDebugData ? getDebugData() : null;

  // =============================
  // CLEAR BUTTON ACTIONS
  // =============================
  const handleClearAll = () => {
    if (!window.confirm("Xóa toàn bộ draft (stay + experience) trong localStorage?")) return;
    reset();
    alert("Đã xóa draft.");
  };

  const handleClearStay = () => {
    if (!window.confirm("Xóa draft Stay?")) return;
    localStorage.removeItem("host_stay_draft");
    setStayData && setStayData({});
    alert("Đã xóa draft Stay.");
  };

  const handleClearExperience = () => {
    if (!window.confirm("Xóa draft Experience?")) return;
    localStorage.removeItem("host_exp_draft");
    setExperienceData && setExperienceData({});
    alert("Đã xóa draft Experience.");
  };

  const handleSend = async () => {
    const ok = await sendHostData();
    if (ok) {
      if (window.confirm("Gửi thành công — xóa draft không?")) reset();
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>🔎 Demo Preview Host Data</h2>

      {/* ACTION BUTTONS */}
      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/")}>🏠 Quay lại Trang Chủ</button>
        <button onClick={() => navigate("/host/stay/create/choose")}>🏠 Tạo Stay mới</button>
        <button onClick={() => navigate("/host/experience/create/choose")}>🎭 Tạo Experience mới</button>

        <button
          onClick={handleSend}
          style={{ marginLeft: 12, background: "#4caf50", color: "#fff" }}
        >
          🚀 Gửi (sendHostData)
        </button>

        <button
          onClick={handleClearAll}
          style={{ marginLeft: 12, background: "#f44336", color: "#fff" }}
        >
          🗑️ Xóa tất cả draft
        </button>

        <button onClick={handleClearStay}>🗑️ Xóa Stay</button>
        <button onClick={handleClearExperience}>🗑️ Xóa Experience</button>
      </div>

      {/* RAW STAY */}
      <h3>📌 RAW — Stay Data (FE)</h3>
      <pre style={{ background: "#f7f7f7", padding: 16, maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(stayData, null, 2)}
      </pre>

      {/* RAW EXPERIENCE */}
      <h3>📌 RAW — Experience Data (FE)</h3>
      <pre style={{ background: "#f7f7f7", padding: 16, maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(experienceData, null, 2)}
      </pre>

      {/* FORMATTED FINAL DATA */}
      <h3>📌 FINAL DATA (After Format — Ready for Backend API)</h3>
      <pre style={{ background: "#eafdee", padding: 16, maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(debug?.formatted, null, 2)}
      </pre>

      {/* DEBUG */}
      {debug && (
        <>
          <h3>🔧 DEBUG (raw + formatted)</h3>
          <pre style={{ background: "#fff7e6", padding: 16, maxHeight: 300, overflow: "auto" }}>
            {JSON.stringify(debug, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
