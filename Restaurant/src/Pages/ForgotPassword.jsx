import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../Services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      alert("Enter valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("send-otp/", { phone });
      alert("OTP sent! (For testing: " + res.data.otp + ")");
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.error || "Phone number not found");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await API.post("verify-otp/", { phone, otp });
      alert("OTP verified!");
      setStep(3);
    } catch (error) {
      alert(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await API.post("reset-password/", { phone, new_password: newPassword });
      alert("Password reset successfully! You can now login.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card auth-card mx-auto" style={{ maxWidth: "450px" }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Forgot Password</h2>

          {/* Step 1: Enter Phone */}
          {step === 1 && (
            <>
              <p className="text-center text-muted mb-3">
                Enter your registered mobile number
              </p>
              <div className="mb-3">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength="10"
                  pattern="[0-9]{10}"
                />
              </div>
              <button
                className="btn btn-success w-100"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <>
              <p className="text-center text-muted mb-3">
                Enter the 6-digit OTP sent to <strong>{phone}</strong>
              </p>
              <div className="mb-3">
                <label className="form-label">OTP</label>
                <input
                  type="text"
                  className="form-control text-center"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  style={{ fontSize: "20px", letterSpacing: "8px" }}
                />
              </div>
              <button
                className="btn btn-success w-100 mb-2"
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setStep(1)}
              >
                Change Number
              </button>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <p className="text-center text-muted mb-3">
                Enter your new password
              </p>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
              <button
                className="btn btn-success w-100 mb-2"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setStep(2)}
              >
                Back to OTP
              </button>
            </>
          )}

          <p className="text-center mt-3">
            Remember your password?{" "}
            <Link to="/login" className="text-decoration-none fw-bold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
