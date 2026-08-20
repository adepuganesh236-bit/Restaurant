import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../Services/api";

function FoodManagement() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedFood, setEditedFood] = useState({
    name: "",
    category: "",
    price: "",
    available: false,
  });

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await API.get("foods/");
      setFoods(response.data);
    } catch (error) {
      console.error("Error fetching foods:", error);
    }
  };

  const deleteFood = async (id) => {
    try {
      await API.delete(`foods/${id}/`);
      fetchFoods();
    } catch (error) {
      console.error("Error deleting food:", error);
    }
  };

  const editFood = (food) => {
    setEditingId(food.id);
    setEditedFood(food);
  };

  const saveChanges = async () => {
    try {
      await API.put(`foods/${editingId}/`, editedFood);

      fetchFoods();

      setEditingId(null);

      setEditedFood({
        name: "",
        category: "",
        price: "",
        available: false,
      });
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="page-title">Food Management</h2>

      <div className="mb-4">
        <Link to="/add-food" className="btn btn-success">
          + Add New Food
        </Link>
      </div>

      <input
        type="text"
        className="form-control fm-search mb-4"
        placeholder="Search food..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {editingId && (
        <div className="card fm-edit-card p-4 mb-4">
          <h4 className="mb-3">Edit Food</h4>

          <div className="row">
            <div className="col-md-3 mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                value={editedFood.name}
                onChange={(e) =>
                  setEditedFood({ ...editedFood, name: e.target.value })
                }
              />
            </div>
            <div className="col-md-3 mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Category"
                value={editedFood.category}
                onChange={(e) =>
                  setEditedFood({ ...editedFood, category: e.target.value })
                }
              />
            </div>
            <div className="col-md-2 mb-2">
              <input
                type="number"
                className="form-control"
                placeholder="Price"
                value={editedFood.price}
                onChange={(e) =>
                  setEditedFood({ ...editedFood, price: e.target.value })
                }
              />
            </div>
            <div className="col-md-2 mb-2">
              <select
                className="form-select"
                value={editedFood.available ? "true" : "false"}
                onChange={(e) =>
                  setEditedFood({
                    ...editedFood,
                    available: e.target.value === "true",
                  })
                }
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            <div className="col-md-2 mb-2">
              <button className="btn btn-success w-100" onClick={saveChanges}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table fm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Food Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {foods
              .filter((food) =>
                food.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((food) => (
                <tr key={food.id}>
                  <td>{food.id}</td>
                  <td>{food.name}</td>
                  <td>{food.category}</td>
                  <td>&#8377;{food.price}</td>
                  <td>
                    {food.available ? (
                      <span className="badge bg-success">Available</span>
                    ) : (
                      <span className="badge bg-danger">Not Available</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => editFood(food)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteFood(food.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FoodManagement;