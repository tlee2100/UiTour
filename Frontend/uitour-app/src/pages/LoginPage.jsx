import React, { useState } from "react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import authAPI from "../services/authAPI";
import { useApp } from "../contexts/AppContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
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
        throw new Error("Missing UserID in login data. Check API payload.");
      }

      // Lưu vào context (AppContext sẽ sync sang localStorage)
      dispatch({ type: "SET_USER", payload: userObj });
      if (token) dispatch({ type: "SET_TOKEN", payload: token });

      // Điều hướng theo vai trò
      const normalizedRole = (userObj.Role || "").toString().toUpperCase();
      if (normalizedRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        // guest / host hoặc các role khác → điều hướng trang chủ
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setIsSendingReset(true);

    try {
      await authAPI.forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess(true);
      // ✅ Điều hướng sang trang reset password, truyền email qua state
      navigate("/reset-password", { state: { email: forgotPasswordEmail } });
    } catch (err) {
      setForgotPasswordError(err.message || "Failed to send password reset email. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordError("");
    setForgotPasswordSuccess(false);
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

          <a
            href="#"
            className="forgot-password-link"
            onClick={(e) => {
              e.preventDefault();
              setShowForgotPassword(true);
            }}
          >
            Forgot Password?
          </a>

          <button
            type="submit"
            className="continue-btn"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Continue"}
          </button>
        </form>

        <Link to="/signup" className="signup-link">Sign up</Link>

        <button className="google-btn" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
          </svg>
          Continue with Facebook
        </button>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="forgot-password-modal" onClick={closeForgotPasswordModal}>
          <div className="forgot-password-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="forgot-password-modal-close" onClick={closeForgotPasswordModal}>
              ×
            </button>

            {!forgotPasswordSuccess ? (
              <>
                <h2 className="login-title">Forgot Password</h2>
                <h3 className="welcome-text">
                  Enter your email address and we'll send you a link to reset your password.
                </h3>

                {forgotPasswordError && (
                  <div style={{
                    color: '#ff4444',
                    fontSize: '14px',
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#ffebee',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    {forgotPasswordError}
                  </div>
                )}

                <form onSubmit={handleForgotPassword}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    disabled={isSendingReset}
                    autoFocus
                  />

                  <button
                    type="submit"
                    className="continue-btn"
                    disabled={isSendingReset}
                  >
                    {isSendingReset ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            ) : (
              <div className="forgot-password-success">
                <div className="forgot-password-success-icon">✓</div>
                <h2 className="login-title" style={{ marginBottom: '12px' }}>Check Your Email</h2>
                <h3 className="welcome-text" style={{ marginBottom: '24px' }}>
                  We've sent a password reset link to<br />
                  <span style={{ color: 'var(--auth-primary)', fontWeight: 600 }}>
                    {forgotPasswordEmail}
                  </span>
                </h3>
                <button
                  type="button"
                  className="continue-btn"
                  onClick={closeForgotPasswordModal}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
