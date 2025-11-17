import React, { useState, useRef, useEffect } from "react";
import authAPI from "../services/authAPI";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./LoginPage.css"; // Dùng lại CSS của LoginPage

const ResetPasswordPage = () => {
const location = useLocation();
const emailFromState = location.state?.email || "";
const [email, setEmail] = useState(emailFromState);
const [otp, setOtp] = useState("");
const [newPassword, setNewPassword] = useState("");
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

const navigate = useNavigate();

const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const otp = otpDigits.join("");
    try {
      await authAPI.resetPassword(email, otp, newPassword);
      setSuccess("Password reset successfully. You can now login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    }
  };
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // chỉ cho phép nhập số

    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
    }
    };

   return (
    <div className="login-container">
      <div className="login-box">
        <button className="close-btn" onClick={() => navigate("/")}>×</button>

        <h2 className="login-title">Reset Password</h2>
        <h3 className="welcome-text">
          Enter the OTP sent to your email and choose a new password.
        </h3>

        {error && (
          <div style={{
            color: '#ff4444',
            fontSize: '14px',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            color: '#2e7d32',
            fontSize: '14px',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#e8f5e9',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

         <div className="otp-container">
            {otpDigits.map((digit, index) => (
                <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                />
            ))}
        </div>

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="continue-btn">
            Reset Password
          </button>
        </form>

        <button
          type="button"
          className="back-to-signup-btn"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
