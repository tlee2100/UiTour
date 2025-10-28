import React, { useState } from "react";
import "./LoginPage.css";
import googleLogo from "../assets/mockdata/images/google.png";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Username:", username);
    console.log("Password:", password);
    // Sau này bạn có thể gọi API login ở đây
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <button className="close-btn">×</button>

        <h2 className="login-title">Login</h2>
        <h3 className="welcome-text">Welcome to UiTour</h3>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="continue-btn">
            Continue
          </button>
        </form>

        <Link to="/signup" className="signup-link">Sign up</Link>

        <button className="google-btn">
          <img
            src={googleLogo}
            alt="Google logo"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
