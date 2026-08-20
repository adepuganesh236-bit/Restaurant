import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../Services/api";

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post("register/", user);
      alert("Registration Successful!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data;
      if (msg?.phone) alert("Phone: " + msg.phone[0]);
      else if (msg?.username) alert("Username: " + msg.username[0]);
      else if (msg?.email) alert("Email: " + msg.email[0]);
      else alert("Registration Failed!");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card auth-card mx-auto" style={{ maxWidth: "450px" }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Register</h2>

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={user.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={user.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="Enter 10-digit mobile number"
                value={user.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                maxLength="10"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  value={user.password}
                  onChange={handleChange}
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
              Register
            </button>

            <p className="text-center mt-3">
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none fw-bold">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
