import { useState } from "react";
import { getFoodImage } from "../Data/FoodImages";

const CATEGORY_COLORS = {
  "Starters": "#e67e22",
  "Veg": "#27ae60",
  "Non-Veg": "#c0392b",
  "Drinks": "#2980b9",
  "Ice Cream": "#8e44ad",
  "Desserts": "#e84393",
};

const FALLBACK_BY_CATEGORY = {
  "Starters": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80",
  "Veg": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
  "Non-Veg": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80",
  "Drinks": "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=400&q=80",
  "Ice Cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80",
  "Desserts": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
};

function FoodCard({ id, name, price, category, cart, setCart }) {
  const [imgSrc, setImgSrc] = useState(getFoodImage(name, category));

  const handleAddToCart = () => {
    const item = { id, name, price: Number(price), quantity: 1 };
    setCart([...cart, item]);
    alert(`${name} added to cart!`);
  };

  const handleImgError = () => {
    setImgSrc(FALLBACK_BY_CATEGORY[category] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80");
  };

  const badgeColor = CATEGORY_COLORS[category] || "#6c757d";

  return (
    <div className="card food-card h-100">
      <div className="food-img-wrapper">
        <img
          src={imgSrc}
          className="card-img-top food-img"
          alt={name}
          onError={handleImgError}
        />
        <span
          className="food-badge"
          style={{ backgroundColor: badgeColor }}
        >
          {category}
        </span>
      </div>

      <div className="card-body d-flex flex-column">
        <h5 className="food-title">{name}</h5>
        <h6 className="food-price mt-auto">&#8377;{price}</h6>

        <button className="btn food-btn mt-2" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default FoodCard;
