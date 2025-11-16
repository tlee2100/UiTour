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

  const handleClearAll = () => {
    if (!window.confirm("Xóa toàn bộ draft (stay + experience) trong localStorage?")) return;
    reset();
    alert("Đã xóa draft.");
  };

  const handleClearStay = () => {
    if (!window.confirm("Xóa draft Stay?")) return;
    // xóa localStorage stay key + reset stay state
    localStorage.removeItem("host_stay_draft");
    setStayData && setStayData({ .../* optional: keep initial shape */ {} });
    // better: call reset then rehydrate experience if you want to keep experience
    alert("Đã xóa draft Stay.");
  };

  const handleClearExperience = () => {
    if (!window.confirm("Xóa draft Experience?")) return;
    localStorage.removeItem("host_exp_draft");
    setExperienceData && setExperienceData({ .../* optional: keep initial shape */ {} });
    alert("Đã xóa draft Experience.");
  };

  const handleSend = async () => {
    const ok = await sendHostData();
    if (ok) {
      // nếu muốn xóa draft sau khi gửi, gọi reset() ở đây
      if (window.confirm("Gửi thành công — xóa draft không?")) reset();
    }
  };

  const debug = getDebugData ? getDebugData() : null;

  return (
    <div style={{ padding: 32 }}>
      <h2>🔎 Demo Preview Host Data</h2>

      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
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

      <h3>📌 RAW — Stay Data</h3>
      <pre style={{ background: "#f7f7f7", padding: 16, maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(stayData, null, 2)}
      </pre>

      <h3>📌 RAW — Experience Data</h3>
      <pre style={{ background: "#f7f7f7", padding: 16, maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(experienceData, null, 2)}
      </pre>

      <h3>📌 FINAL DATA (After Format)</h3>
      <pre style={{ background: "#eafdee", padding: 16, maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(getFinalData(), null, 2)}
      </pre>

      {debug && (
        <>
          <h3>🔧 DEBUG</h3>
          <pre style={{ background: "#fff7e6", padding: 16, maxHeight: 300, overflow: "auto" }}>
            {JSON.stringify(debug, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
