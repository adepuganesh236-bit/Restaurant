import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../Services/api";

const PAYMENT_METHODS = [
  { id: "Online", label: "Online Payment", desc: "UPI / Net Banking / Wallets", icon: "📱" },
  { id: "Card", label: "Credit / Debit Card", desc: "Visa, MasterCard, Rupay", icon: "💳" },
  { id: "Cash", label: "Cash on Delivery", desc: "Pay when you receive", icon: "💵" },
];

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const total = location.state?.total || 0;
  const orderIds = location.state?.orderIds || [];
  const orderId = location.state?.orderId;
  const [method, setMethod] = useState("Online");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const ids = orderId ? [orderId] : orderIds;
      for (const id of ids) {
        await API.patch(`orders/${id}/`, {
          payment_status: "Paid",
          payment_method: method,
        });
      }
      alert("Payment Successful!");
      navigate("/orders", { state: { orderIds: ids } });
    } catch (error) {
      console.error("Payment update failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card payment-card">
            <div className="card-body text-center">
              <h2 className="mb-2">Payment</h2>
              <p className="text-muted mb-4">Complete your order payment</p>

              <div className="bg-light rounded-3 p-3 mb-4">
                <h4 className="mb-0" style={{ color: "#27ae60", fontWeight: 700 }}>
                  Total: &#8377;{total}
                </h4>
              </div>

              <div className="text-start mb-4">
                <label className="form-label fw-bold mb-3">Select Payment Method</label>

                {PAYMENT_METHODS.map((pm) => (
                  <div
                    key={pm.id}
                    className={`payment-radio ${method === pm.id ? "selected" : ""}`}
                    onClick={() => setMethod(pm.id)}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      id={pm.id}
                      value={pm.id}
                      checked={method === pm.id}
                      onChange={() => setMethod(pm.id)}
                      className="me-2"
                    />
                    <span className="me-2" style={{ fontSize: "20px" }}>{pm.icon}</span>
                    <div className="d-inline-block">
                      <div className="fw-bold">{pm.label}</div>
                      <small className="text-muted">{pm.desc}</small>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-success btn-lg w-100"
                onClick={handlePayment}
                disabled={loading}
                style={{ borderRadius: "12px", padding: "12px", fontWeight: 600 }}
              >
                {loading ? "Processing..." : `Pay \u20B9${total}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
