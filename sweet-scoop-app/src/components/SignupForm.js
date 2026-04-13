import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DisplayStatus from "./DisplayStatus";

function SignupForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateSignup = () => {
    if (!username || !email || !password || !confirmPassword) {
      return "All fields are required";
    }

    if (username.length < 3 || username.length > 20) {
      return "Username must be between 3 and 20 characters.";
    }
    if (!/^[A-Za-z]/.test(username)) {
      return "Username must start with a letter.";
    }
    if (!/^[A-Za-z0-9_-]+$/.test(username)) {
      return "Username may only contain letters, numbers, underscores, and hyphens.";
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return "Email must be in a valid format.";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const validationError = validateSignup();
    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: "success", message: "Signup successful! Redirecting to login..." });
        
        // Redirect to login page after short delay
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setStatus({ type: "error", message: data.message || "Signup failed" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error. Is the backend running?" });
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <form onSubmit={handleSignup}>
        <h2 className="login-title">Sign Up</h2>

        <label>Username</label>
        <input
          className="login-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <br />

        <label>Email</label>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <br />

        <label>Confirm Password</label>
        <input
          className="login-input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <br />

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <div className="signin-link">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="signin-link-text">
              Log in
            </Link>
          </p>
        </div>

        {status && (
          <DisplayStatus type={status.type} message={status.message} />
        )}
      </form>
    </div>
  );
}

export default SignupForm;
