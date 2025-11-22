import React from "react";
import "./HostHeader.css";
import logo from "../assets/UiTour.png";
import { useNavigate } from "react-router-dom"; // ✅ import navigate hook

export default function HostHeader() {
  const navigate = useNavigate(); // ✅ khởi tạo hook điều hướng

  return (
    <header className="hheader">
      <div
        className="hheader-logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="UiTour Logo" className="hheader-logo-image" />
      </div>
    </header>
  );
}
