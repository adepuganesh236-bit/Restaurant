import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function OrderChart({ orders }) {
  const pending = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const preparing = orders.filter(
    (order) => order.status === "Preparing"
  ).length;

  const outForDelivery = orders.filter(
    (order) => order.status === "Out for Delivery"
  ).length;

  const delivered = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const cancelled = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  const data = {
    labels: [
      "Pending",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ],
    datasets: [
      {
        label: "Orders",
        data: [
          pending,
          preparing,
          outForDelivery,
          delivered,
          cancelled,
        ],
      },
    ],
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h4>Order Status Chart</h4>
      </div>

      <div className="card-body">
        <Pie data={data} />
      </div>
    </div>
  );
}

export default OrderChart;