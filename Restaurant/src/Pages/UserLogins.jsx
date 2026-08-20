import { useEffect, useState } from "react";
import API from "../Services/api";

function UserLogins() {
  const [logins, setLogins] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogins();
  }, []);

  const fetchLogins = async () => {
    try {
      const res = await API.get("user-logins/");
      setLogins(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredLogins = logins.filter((l) =>
    l.username.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2 className="page-title">User Logins</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control fm-search"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <button className="btn btn-outline-success btn-sm" onClick={fetchLogins}>
            Refresh
          </button>
        </div>
      </div>

      <div className="dashboard-chart-card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No login records found.
                  </td>
                </tr>
              ) : (
                filteredLogins.map((login, index) => (
                  <tr key={login.id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{login.username}</td>
                    <td>{login.email}</td>
                    <td>
                      <span className={`badge ${login.is_staff ? "bg-primary" : "bg-secondary"}`}>
                        {login.is_staff ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>{new Date(login.logged_in_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${login.is_active ? "bg-success" : "bg-danger"}`}>
                        {login.is_active ? "Online" : "Offline"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-3 pb-3">
          <small className="text-muted">Total records: {filteredLogins.length}</small>
        </div>
      </div>
    </div>
  );
}

export default UserLogins;
