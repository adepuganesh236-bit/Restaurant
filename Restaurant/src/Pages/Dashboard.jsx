import { useEffect, useState } from "react";
import API from "../Services/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState({
    total_foods: 0,
    total_orders: 0,
    total_revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get("dashboard-stats/");
        setStats(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  const data = {
    labels: ["Foods", "Orders", "Revenue"],
    datasets: [
      {
        label: "Restaurant Statistics",
        data: [
          stats.total_foods,
          stats.total_orders,
          stats.total_revenue,
        ],
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF9800",
        ],
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h2 className="page-title">Admin Dashboard</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card dashboard-stat-card foods">
            <div className="card-body">
              <h5>Total Foods</h5>
              <h2>{stats.total_foods}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-stat-card orders">
            <div className="card-body">
              <h5>Total Orders</h5>
              <h2>{stats.total_orders}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-stat-card revenue">
            <div className="card-body">
              <h5>Total Revenue</h5>
              <h2>&#8377;{stats.total_revenue}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card dashboard-chart-card p-4">
        <Bar data={data} />
      </div>
    </div>
  );
}

export default Dashboard;