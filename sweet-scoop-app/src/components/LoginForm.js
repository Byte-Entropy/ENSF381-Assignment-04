import React, { useState, createContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthMessage from "./AuthMessage";
import DisplayStatus from "./DisplayStatus";

export const AuthContext = createContext();

function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (username === "" || password === "") {
      setStatus({ type: "error", message: "Fields cannot be empty" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store login state in localStorage
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        
        setStatus({ type: "success", message: data.message });
        
        // Redirect to flavors page after short delay
        setTimeout(() => {
          navigate("/flavors");
        }, 1000);
      } else {
        setStatus({ type: "error", message: data.message || "Login failed" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error. Is the backend running?" });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ status }}>
      <div className="login-form">
        <form onSubmit={handleLogin}>
          <h2 className="login-title">Login</h2>

          <label>Username</label>
          <input
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <br />
          
          <label>Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          
          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="forgot-password">Forgot Password?</p>

          <div className="signup-link">
            <p>
              Need an account?{" "}
              <Link to="/signup" className="signup-link-text">
                Sign up
              </Link>
            </p>
          </div>

          {status && (
            <DisplayStatus type={status.type} message={status.message} />
          )}
        </form>
      </div>
    </AuthContext.Provider>
  );
}

export default LoginForm;