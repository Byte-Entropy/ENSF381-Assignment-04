import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");
    
    if (userId && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear login state
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    
    // Update UI
    setIsLoggedIn(false);
    setUsername("");
    
    // Redirect to home
    navigate("/");
  };

  return (
    <>
      <header>
        <img src="/images/logo.webp" alt="Sweet Scoop" />
        <h1>Sweet Scoop Ice Cream Shop</h1>
      </header>

      <div className="navbar">
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/flavors">Flavors</Link>
          <Link to="/orders">Order History</Link>
        </div>
        
        <div className="nav-auth">
          {isLoggedIn ? (
            <>
              <span className="username">{username}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;