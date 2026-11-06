import { useState, useEffect } from "react";
import axios from "axios";
import FoodCard from "../Components/FoodCard";
import Navbar from "../Components/Navbar";

const RAW_API_BASE =
  import.meta.env.VITE_API_URL || "https://restaurant-backend-4phd.onrender.com/api/";
const API_BASE = RAW_API_BASE.endsWith("/") ? RAW_API_BASE : `${RAW_API_BASE}/`;
const FOODS_URL = `${API_BASE}foods/`;

const CATEGORIES = ["All", "Starters", "Veg", "Non-Veg", "Drinks", "Ice Cream", "Desserts"];

const CATEGORY_ORDER = ["Starters", "Veg", "Non-Veg", "Drinks", "Ice Cream", "Desserts"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Four attempts are enough to ride out a Render cold start without leaving the
// spinner running for minutes. A valid (even empty) response stops retrying.
const RETRY_DELAYS = [0, 5000, 10000, 15000];

const extractFoods = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return null;
};

function Menu({ cart, setCart }) {
  const [search, setSearch] = useState("");
  const [foods, setFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchFoods = async () => {
    setLoading(true);
    setLoadError(false);

    for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
      if (attempt > 0) {
        await sleep(RETRY_DELAYS[attempt]);
      }

      try {
        const res = await axios.get(FOODS_URL, { timeout: 20000 });
        const items = extractFoods(res.data);
        if (items) {
          setFoods(items);
          setLoading(false);
          return;
        }
        console.error("Menu fetch returned an unexpected response shape");
      } catch (error) {
        console.error(`Menu fetch attempt ${attempt + 1} failed:`, error.message);
      }
    }

    setLoadError(true);
    setLoading(false);
  };

  useEffect(() => {
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

      <div className="menu-page">
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
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : loadError ? (
            <div className="text-center py-5">
              <h5 className="text-danger">Could not load the menu.</h5>
              <p className="text-muted mb-3">
                The free-tier server may be waking up. Please try again.
              </p>
              <button className="btn btn-success" onClick={() => fetchFoods()}>
                Retry
              </button>
            </div>
          ) : foods.length === 0 ? (
            <div className="text-center py-5">
              <h5>No food items are available right now.</h5>
              <p className="text-muted mb-3">
                The menu is empty. Please check back soon.
              </p>
              <button className="btn btn-success" onClick={() => fetchFoods()}>
                Retry
              </button>
            </div>
          ) : filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <div className="col-md-4 col-lg-3 mb-4" key={food.id}>
                <FoodCard
                  id={food.id}
                  name={food.name}
                  price={food.price}
                  category={food.category}
                  image={food.image}
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
      </div>
    </>
  );
}

export default Menu;
