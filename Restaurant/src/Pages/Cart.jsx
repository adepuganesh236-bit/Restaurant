import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";

function Cart({ cart, setCart }) {
  const removeItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.price) * (item.quantity || 1);
  }, 0);

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <h2 className="page-title">Your Cart</h2>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <h4>Your cart is empty.</h4>
            <Link to="/menu" className="btn btn-success">
              Go to Menu
            </Link>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table cart-card">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Food Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>&#8377;{item.price}</td>
                      <td>{item.quantity || 1}</td>
                      <td>&#8377;{Number(item.price) * (item.quantity || 1)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cart-total-bar">
              <h4>Total: &#8377;{total}</h4>
              <Link to="/checkout" className="btn btn-success btn-lg">
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;
