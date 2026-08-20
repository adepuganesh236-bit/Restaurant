import { useEffect, useState } from "react";
import API from "../Services/api";

function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get("orders/");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Order History</h2>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Food</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Ordered At</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.food_name || order.food}</td>
              <td>{order.quantity}</td>
              <td>₹{order.total_price}</td>
              <td>{order.ordered_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderHistory;