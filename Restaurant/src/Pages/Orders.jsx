import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../Services/api";
import Invoice from "../Components/Invoice";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const recentOrderIds = location.state?.orderIds || [];

  const fetchOrders = async () => {
    try {
      const response = await API.get("orders/");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id) => {
    try {
      await API.patch(`orders/${id}/`, {
        status: "Cancelled",
      });

      alert("Order cancelled successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <h3>Loading orders...</h3>
      </div>
    );
  }

  const recentOrders = recentOrderIds.length > 0
    ? orders.filter((o) => recentOrderIds.includes(o.id))
    : [];

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-center">No orders found.</p>
      ) : (
        <>
          {recentOrders.length > 0 && (
            <div className="mb-4">
              <Invoice orders={recentOrders} />
            </div>
          )}

          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Order ID</th>
                <th>Food Item</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th>Method</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>

                  <td>{order.food_name || order.food}</td>

                  <td>{order.quantity}</td>

                  <td>&#8377;{order.total_price}</td>

                  <td>
                    {order.status === "Pending" && (
                      <span className="badge bg-warning text-dark">
                        Pending
                      </span>
                    )}

                    {order.status === "Preparing" && (
                      <span className="badge bg-info">
                        Preparing
                      </span>
                    )}

                    {order.status === "Out for Delivery" && (
                      <span className="badge bg-primary">
                        Out for Delivery
                      </span>
                    )}

                    {order.status === "Delivered" && (
                      <span className="badge bg-success">
                        Delivered
                      </span>
                    )}

                    {order.status === "Cancelled" && (
                      <span className="badge bg-danger">
                        Cancelled
                      </span>
                    )}
                  </td>

                  <td>
                    {order.payment_status === "Paid" ? (
                      <span className="badge bg-success">
                        Paid
                      </span>
                    ) : (
                      <span className="badge bg-secondary">
                        Pending
                      </span>
                    )}
                  </td>

                  <td>{order.payment_method || "-"}</td>

                  <td>
                    {order.status === "Pending" && (
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                    {order.payment_status === "Pending" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          navigate("/payment", {
                            state: {
                              total: order.total_price,
                              orderId: order.id,
                            },
                          })
                        }
                      >
                        Pay Now
                      </button>
                    )}
                    {order.payment_status === "Paid" &&
                      order.status !== "Pending" && (
                        <span className="text-muted">-</span>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Orders;
