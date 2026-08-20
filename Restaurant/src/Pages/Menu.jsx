import { useState, useEffect } from "react";
import FoodCard from "../Components/FoodCard";
import Navbar from "../Components/Navbar";
import API from "../Services/api";

const CATEGORIES = ["All", "Starters", "Veg", "Non-Veg", "Drinks", "Ice Cream", "Desserts"];

const CATEGORY_ORDER = ["Starters", "Veg", "Non-Veg", "Drinks", "Ice Cream", "Desserts"];

function Menu({ cart, setCart }) {
  const [search, setSearch] = useState("");
  const [foods, setFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await API.get("foods/");
        setFoods(res.data);
      } catch (error) {
        console.error("Error fetching foods:", error);
      }
    };
    fetchFoods();
  }, []);

  const filteredFoods = foods
    .filter((food) => {
      const matchSearch = food.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        activeCategory === "All" || food.category === activeCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (activeCategory !== "All") return 0;
      const order = CATEGORY_ORDER;
      return order.indexOf(a.category) - order.indexOf(b.category);
    });

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="mb-4">
          <a href="/" className="btn btn-outline-primary">
            Home
          </a>
        </div>

        <h2 className="text-center fw-bold mb-4">Our Menu</h2>

        {/* Search */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-8">
            <div className="input-group menu-search">
              <input
                type="text"
                className="form-control"
                placeholder="Search food items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
              <button className="btn btn-success" type="button">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`btn category-btn ${
                activeCategory === cat ? "active" : ""
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Items */}
        <div className="row">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <div className="col-md-4 col-lg-3 mb-4" key={food.id}>
                <FoodCard
                  id={food.id}
                  name={food.name}
                  price={food.price}
                  category={food.category}
                  cart={cart}
                  setCart={setCart}
                />
              </div>
            ))
          ) : (
            <div className="text-center">
              <h5>No food items found.</h5>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Menu;
