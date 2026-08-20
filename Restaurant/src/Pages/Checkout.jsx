import API from "../Services/api";
import { useNavigate } from "react-router-dom";

function Checkout({ cart, setCart }) {
  const navigate = useNavigate();
  const placeOrder = async () => {
    // ensure user is authenticated (backend may require auth)
    const token = localStorage.getItem("access");
    if (!token) {
      alert("You must be logged in to place an order.");
      return;
    }

    try {
      const orderIds = [];
      for (const item of cart) {
        const payload = {
          food: item.id,
          quantity: item.quantity || 1,
          total_price: Number(item.price) * (item.quantity || 1),
        };
        console.log("Posting order payload:", payload);

        const res = await API.post("orders/", payload);
        console.log("Order created:", res.data);
        orderIds.push(res.data.id);
      }

      if (typeof setCart === "function") setCart([]);
      const total = cart.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      );
      navigate("/payment", { state: { total, orderIds } });
    } catch (error) {
      // show detailed server validation error when available
      console.error("Order request failed:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Response data:", error.response.data);
        alert(`Failed to place order: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Failed to place order: " + (error.message || "unknown error"));
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>

      <button className="btn btn-success" onClick={placeOrder}>
        Place Order
      </button>
    </div>
  );
}

export default Checkout;