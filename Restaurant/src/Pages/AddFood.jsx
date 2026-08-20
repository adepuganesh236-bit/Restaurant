import { useState } from "react";
import API from "../Services/api";

function AddFood() {
  const [food, setFood] = useState({
    name: "",
    category: "Veg",
    price: "",
    available: "Yes",
  });

  const handleChange = (e) => {
    setFood({ ...food, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("foods/", {
        name: food.name,
        category: food.category,
        price: food.price,
        available: food.available === "Yes",
      });
      alert("Food added successfully!");
      setFood({ name: "", category: "Veg", price: "", available: "Yes" });
    } catch (error) {
      console.error(error);
      alert("Error adding food!");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card add-food-card">
            <div className="card-body">
              <h2 className="page-title">Add New Food</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Food Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={food.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    className="form-select"
                    value={food.category}
                    onChange={handleChange}
                    required
                  >
                    <option>Veg</option>
                    <option>Non-Veg</option>
                    <option>Starters</option>
                    <option>Drinks</option>
                    <option>Ice Cream</option>
                    <option>Desserts</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    value={food.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Availability</label>
                  <select
                    name="available"
                    className="form-select"
                    value={food.available}
                    onChange={handleChange}
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <button className="btn btn-success w-100">Add Food</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddFood;
