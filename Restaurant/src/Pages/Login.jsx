import { useState } from "react";
import API from "../Services/api";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("token/", user);

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      try {
        await API.post("track-login/", {});
      } catch {
        // login tracking is optional - never block the login itself
      }

      alert("Login Successful!");
      navigate("/");
    } catch (error) {
      console.error(error);
      if (!error.response) {
        alert("Server is waking up (free tier). Please wait ~30s and try again.");
      } else if (error.response.status === 401) {
        alert("Invalid Username or Password");
      } else {
        alert("Login failed. Please try again. (" + error.response.status + ")");
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="card auth-card mx-auto" style={{ maxWidth: "450px" }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Login</h2>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                className="form-control"
                value={user.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  value={user.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-success w-100">
              Login
            </button>

            <p className="text-center mt-3">
              <Link to="/forgot-password" className="text-decoration-none fw-bold text-danger">
                Forgot Password?
              </Link>
            </p>

            <p className="text-center mt-2">
              Don't have an account?{" "}
              <Link to="/register" className="text-decoration-none fw-bold">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
