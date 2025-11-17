import React from "react";
import "./HostHeader.css";
import logo from "../assets/UiTour.png";
import { useNavigate } from "react-router-dom"; // ✅ import navigate hook

export default function HostHeader() {
  const navigate = useNavigate(); // ✅ khởi tạo hook điều hướng

  return (
    <header className="hheader">
      <div className="hheader-container">
        <div
          className="hheader-logo"
          onClick={() => navigate("/")} // ✅ khi click logo sẽ quay về "/"
          style={{ cursor: "pointer" }} // thêm hiệu ứng con trỏ
        >
          <img src={logo} alt="UiTour Logo" className="hheader-logo-image" />
        </div>
      </div>
    </header>
  );
}
