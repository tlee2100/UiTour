import React, { useState } from "react";
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
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(fullName, email, phone, password);
      
      // Lưu user vào context
      dispatch({ type: 'SET_USER', payload: response });
      
      // Chuyển hướng về trang chủ sau khi đăng ký thành công
      navigate("/");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <button className="close-btn" onClick={() => navigate('/')}>×</button>

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

        {/* ✅ Gom hai nút vào cùng khối để dễ canh chỉnh */}
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

          {/* ✅ Đặt hai nút cùng trong 1 khối */}
          <div className="button-group">
            <button 
              type="submit" 
              className="continue-btn"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng ký..." : "Continue"}
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
      </div>
    </div>
  );
};

export default SignUpPage;
