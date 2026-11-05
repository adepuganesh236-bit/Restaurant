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

    if (!cart || cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const orderIds = [];
      for (const item of cart) {
        const payload = {
          food: item.id,
          quantity: item.quantity || 1,
        };

        const res = await API.post("orders/", payload);
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
      if (error.response) {
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