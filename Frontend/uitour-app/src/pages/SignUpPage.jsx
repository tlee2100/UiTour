import React, { useState } from "react";
import "./LoginPage.css"; // Dùng lại CSS của LoginPage
import googleLogo from "../assets/mockdata/images/google.png";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    // Sau này bạn có thể gọi API đăng ký ở đây
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <button className="close-btn">×</button>

        <h2 className="login-title">Sign up</h2>
        <h3 className="welcome-text">Welcome to UiTour</h3>

        {/* ✅ Gom hai nút vào cùng khối để dễ canh chỉnh */}
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* ✅ Đặt hai nút cùng trong 1 khối */}
          <div className="button-group">
            <button type="submit" className="continue-btn">
              Continue
            </button>

            <button type="button" className="google-btn">
              <img src={googleLogo} alt="Google logo" />
              Continue with Google
            </button>
          </div>
        </form>

        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
