import React, { useState } from "react";
import { useNavigate } from "react-router";
import "../LoginPage.css";
import toast from "react-hot-toast";
import axios from "axios"; 

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faSpinner,
  faShoppingBag // Added icon for the customer storefront escape hatch
} from "@fortawesome/free-solid-svg-icons";

function Login() {
  const navigate = useNavigate();

  // 1. Switched email state over to username
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      // 2. Sending username in the payload body
      const response = await axios.post(
        "https://alluring-accent-backend.onrender.com/api/admin/signin",
        {
          username: username,
          password: password
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem("ACCESS_TOKEN", response.data.token);
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminToken", response.data.token);

        toast.success("Welcome Admin!", {
          duration: 2000,
          style: {
            borderRadius: "14px",
            background: "rgba(20,20,20,0.9)",
            color: "#fff",
            backdropFilter: "blur(10px)",
            padding: "14px 18px",
          },
        });

        navigate("/dashboard", { replace: true });
      }

    } catch (error) {
      console.error("Login network error:", error);

      const backendMessage = error.response?.data?.message || "Invalid username or password.";
      
      toast.error(backendMessage, {
        duration: 2000,
        style: {
          borderRadius: "14px",
          background: "rgba(20,20,20,0.9)",
          color: "#fff",
          backdropFilter: "blur(10px)",
          padding: "14px 18px",
          border: "1px solid rgba(255,255,255,0.1)",
        },
        iconTheme: {
          primary: "#ff4b4b",
          secondary: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page bg-[linear-gradient(90deg,#f7e9ea_0%,#e9d4d2_40%,#d8b1ad_75%,#c7938f_100%)]">
      <div className="background-glow glow-1"></div>
      <div className="background-glow glow-2"></div>

      <form onSubmit={handleLogin} className="login-form">
        <h1 className="login-title">Admin Login</h1>

        <p className="login-subtitle">
          Don't have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            <a href="/signup">Sign up</a>
          </span>
        </p>

        {/* USERNAME */}
        <div className="lg-input-group">
          <label> <strong>Username</strong> </label>
          <div className="lg-input-box">
            <FontAwesomeIcon icon={faUser} className="lg-left-icon" />
            <input
              type="text" 
              name="username" 
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="lg-input-group">
          <label> <strong>Password</strong> </label>
          <div className="lg-input-box">
            <FontAwesomeIcon icon={faLock} className="lg-left-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              className="lg-right-icon"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
        </div>

        {/* PRIMARY SUBMIT BUTTON */}
        <button
          type="submit"
          className="login-btn"
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? (
            <span className="btn-loading">
              <FontAwesomeIcon icon={faSpinner} spin /> Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        {/* DECORATIVE SEPARATOR LINE */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px', color: 'rgba(0,0,0,0.15)' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'currentColor' }}></div>
          <span style={{ padding: '0 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'currentColor' }}></div>
        </div>

        {/* CUSTOMER FACING STOREFRONT REDIRECT BUTTON */}
        <button
          type="button"
          className="storefront-redirect-btn"
          onClick={() => navigate("/")} // Adjust path string to your custom client storefront router target if needed
          style={{
            marginTop: '-70px',
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '2px dashed #be185d',
            background: 'transparent',
            color: '#be185d',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <FontAwesomeIcon icon={faShoppingBag} />
          Go to Customer Storefront
        </button>
      </form>
    </div>
  );
}

export default Login;