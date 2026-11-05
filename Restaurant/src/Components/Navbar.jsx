import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../Services/api";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;
      try {
        const response = await API.get("user-info/");
        setUser(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("track-logout/");
    } catch {
      // best-effort - always clear local session
    }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm" style={{ zIndex: 1000 }}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Restaurant App
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/menu">Menu</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
            {user?.is_staff && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
            )}
            {user?.is_staff && (
              <li className="nav-item">
                <Link className="nav-link" to="/food-management">Food Management</Link>
              </li>
            )}
            {user?.is_staff && (
              <li className="nav-item">
                <Link className="nav-link" to="/user-logins">User Logins</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm">Login</Link>
                <Link to="/register" className="btn btn-success btn-sm">Register</Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="btn btn-outline-light btn-sm">Profile</Link>
                <Link to="/orders" className="btn btn-outline-info btn-sm">Orders</Link>
                <Link to="/cart" className="btn btn-warning btn-sm">Cart</Link>
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
