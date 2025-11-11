import React from "react";
import { useHost } from "../contexts/HostContext";
import { useNavigate } from "react-router-dom";

export default function HostDemoPreview() {
  const { stayData, experienceData } = useHost();
  const navigate = useNavigate();
  return (
    <div style={{ padding: 32 }}>
      <h2>🔎 Demo Preview Host Data</h2>
      <pre>{JSON.stringify(stayData, null, 2)}</pre>
      <pre>{JSON.stringify(experienceData, null, 2)}</pre>
      <button onClick={() => navigate("/")}>Quay lại Trang Chủ</button>
      <button onClick={() => navigate("/host/stay/create/choose")}>Tạo Host (Stay) mới</button>
      <button onClick={() => navigate("/host/experience/create/choose")}>Tạo Host (Experience) mới</button>
    </div>
  );
}
