import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../Services/api";

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await API.get("user-info/");
        setIsAdmin(response.data.is_staff);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return isAdmin ? children : <Navigate to="/" replace />;
}

export default AdminRoute;