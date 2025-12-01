import React, { useState, useRef, useEffect } from "react";
import "./LoginPage.css"; // Dùng lại CSS của LoginPage
import googleLogo from "../assets/mockdata/images/google.png";
import { Link, useNavigate } from "react-router-dom";
import authAPI from "../services/authAPI";
import { useApp } from "../contexts/AppContext";

const SignUpPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpInputRefs = useRef([]);
  const { dispatch } = useApp();
  const navigate = useNavigate();

  // Start resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Focus first OTP input when OTP step is shown
  useEffect(() => {
    if (showOTP && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [showOTP]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password confirmation does not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    setIsLoading(true);

    try {
      // Send OTP to email
      await authAPI.sendOTP(email);

      setShowOTP(true);
      setResendTimer(60); // 60 seconds countdown
    } catch (err) {
      setError(err.message || "Unable to send OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
    setOtpError("");

    // Focus the last filled input or the last input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    otpInputRefs.current[lastIndex]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit OTP code.");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    try {
      // Verify OTP
      await authAPI.verifyOTP(email, otpCode);

      // If OTP is verified, proceed with registration
      const response = await authAPI.register(fullName, email, phone, password);
      
      // Lưu user vào context
      dispatch({ type: 'SET_USER', payload: response });
      
      // Chuyển hướng về trang chủ sau khi đăng ký thành công
      navigate("/login");
    } catch (err) {
      setOtpError(err.message || "Invalid OTP code. Please try again.");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setOtpError("");

    try {
      await authAPI.sendOTP(email);

      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setOtpError(err.message || "Unable to resend OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <button className="close-btn" onClick={() => navigate('/')}>×</button>

        {!showOTP ? (
          <>
            <h2 className="login-title">Sign up</h2>
            <h3 className="welcome-text">Welcome to UiTour</h3>

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

            <form onSubmit={handleSignUp}>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <input
                type="tel"
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <div className="button-group">
                <button 
                  type="submit" 
                  className="continue-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP code..." : "Continue"}
                </button>

                <button 
                  type="button" 
                  className="google-btn"
                  disabled={isLoading}
                >
                  <img src={googleLogo} alt="Google logo" />
                  Continue with Google
                </button>
              </div>
            </form>

            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="login-title">Verify Email</h2>
            <h3 className="welcome-text">
              We've sent a 6-digit code to<br />
              <span style={{ color: 'var(--auth-primary)', fontWeight: 600 }}>{email}</span>
            </h3>


            {otpError && (
              <div style={{ 
                color: '#ff4444', 
                fontSize: '14px', 
                marginBottom: '15px', 
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                {otpError}
              </div>
            )}

            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onPaste={handleOTPPaste}
                  className="otp-input"
                  disabled={isVerifying}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="button"
              className="continue-btn"
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.join("").length !== 6}
              style={{ marginTop: '20px' }}
            >
              {isVerifying ? "Đang xác thực..." : "Verify Email"}
            </button>

            <div className="otp-resend">
              <p style={{ fontSize: '14px', color: 'var(--auth-muted)', margin: '20px 0 10px' }}>
                Didn't receive the code?
              </p>
              <button
                type="button"
                className="resend-otp-btn"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isLoading}
              >
                {resendTimer > 0 
                  ? `Resend code in ${resendTimer}s` 
                  : "Resend code"}
              </button>
            </div>

            <button
              type="button"
              className="back-to-signup-btn"
              onClick={() => {
                setShowOTP(false);
                setOtp(["", "", "", "", "", ""]);
                setOtpError("");
                setResendTimer(0);
              }}
              disabled={isVerifying}
            >
              ← Back to sign up
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
