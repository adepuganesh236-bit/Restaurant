import { useEffect, useState } from "react";
import API from "../services/api";

function Profile() {
  const [user, setUser] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await API.get("profile/");
      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card profile-card">
            <div className="card-body text-center">
              <div className="profile-avatar">
                {user.username ? user.username[0].toUpperCase() : "?"}
              </div>

              <h3 className="mb-1" style={{ fontWeight: 700, color: "#2d3436" }}>
                {user.username}
              </h3>
              <p className="text-muted mb-4">My Account</p>

              <div className="profile-info-item">
                <span className="label">Username</span>
                <span className="value">{user.username}</span>
              </div>

              <div className="profile-info-item">
                <span className="label">Email</span>
                <span className="value">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
