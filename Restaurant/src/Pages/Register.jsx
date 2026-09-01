import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API, { wakeBackend, ensureBackendAwake } from "../Services/api";

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    wakeBackend();
  }, []);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setWaking(true);

    const awake = await ensureBackendAwake();
    if (!awake) {
      setWaking(false);
      alert("The server is taking unusually long to start. Please try again in a minute.");
      return;
    }
    setWaking(false);

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
      else if (msg?.password) alert("Password: " + msg.password[0]);
      else if (typeof msg?.detail === "string") alert(msg.detail);
      else if (error.response && [502, 503, 504].includes(error.response.status))
        alert("Server is waking up (free tier). Please wait ~30s and try again.");
      else if (!error.response)
        alert("Server is waking up (free tier). Please wait ~30s and try again.");
      else alert("Registration Failed! Please try again.");
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

            <button type="submit" className="btn btn-success w-100" disabled={waking}>
              {waking ? "Waking up server..." : "Register"}
            </button>

            {waking && (
              <p className="text-center text-muted mt-2 mb-0">
                The free-tier server is cold-starting. This can take up to a minute.
              </p>
            )}

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
