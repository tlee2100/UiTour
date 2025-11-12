import React, { useState } from "react";
import "./LoginPage.css";
import googleLogo from "../assets/mockdata/images/google.png";
import { Link, useNavigate } from "react-router-dom";
import authAPI from "../services/authAPI";
import { useApp } from "../contexts/AppContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      // Chuẩn hoá mọi kiểu response:
      // 1) { user, token }
      // 2) { ...userFields, token? }
      // 3) { user: {...}, accessToken/jwt? }
      const nestedUser = response?.user && typeof response.user === "object" ? response.user : null;
      const rawUser = nestedUser ?? response ?? {};
      const token =
        response?.token ??
        response?.accessToken ??
        response?.jwt ??
        rawUser?.token ?? null;

      // Chuẩn hoá casing để ProfilePage có thể dùng user.UserID
      const userObj = {
        ...rawUser,
        UserID: rawUser?.UserID ?? rawUser?.userID ?? rawUser?.id ?? rawUser?.Id ?? null,
        Email: rawUser?.Email ?? rawUser?.email ?? "",
        FullName: rawUser?.FullName ?? rawUser?.fullName ?? "",
        Role: rawUser?.Role ?? rawUser?.role ?? "Guest",
      };

      if (!userObj.UserID) {
        // nếu vẫn không có id => backend chưa trả đúng; báo lỗi dễ hiểu
        throw new Error("Thiếu UserID trong dữ liệu đăng nhập. Kiểm tra payload từ API.");
      }

      // Lưu vào context (AppContext sẽ sync sang localStorage)
      dispatch({ type: "SET_USER", payload: userObj });
      if (token) dispatch({ type: "SET_TOKEN", payload: token });

      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please check your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <button className="close-btn" onClick={() => navigate('/')}>×</button>

        <h2 className="login-title">Login</h2>
        <h3 className="welcome-text">Welcome to UiTour!</h3>

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

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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

          <button
            type="submit"
            className="continue-btn"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Continue"}
          </button>
        </form>

        <Link to="/signup" className="signup-link">Sign up</Link>

        <button className="google-btn" type="button">
          <img src={googleLogo} alt="Google logo" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
