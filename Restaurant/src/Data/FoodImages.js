const FOOD_IMAGES = {
  // Starters
  "Chicken Wings": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=400&q=80",
  "Paneer Tikka": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80",
  "Veg Spring Rolls": "https://images.unsplash.com/photo-1606525437679-05b91f0dbfaa?auto=format&fit=crop&w=400&q=80",
  "Chicken 65": "https://images.unsplash.com/photo-1610057099443-fde6c99db9e1?auto=format&fit=crop&w=400&q=80",
  "Fish Fingers": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80",
  "Hara Bhara Kebab": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80",
  "Tandoori Chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80",
  "Onion Rings": "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=400&q=80",
  "Chicken Momos": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80",
  "Veg Momos": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=400&q=80",
  "Samosa": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80",
  "Aloo Tikki": "https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=400&q=80",
  "Pani Puri": "https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=400&q=80",
  "Dahi Puri": "https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=400&q=80",
  "Chicken Seekh Kebab": "https://images.unsplash.com/photo-1599487488170-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80",
  "Paneer Pakora": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80",

  // Veg
  "Paneer Butter Masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80",
  "Veg Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
  "Veg Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80",
  "Veg Pulao": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
  "Pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80",
  "Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
  "French Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80",
  "Chole Bhature": "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=400&q=80",
  "Masala Dosa": "https://images.unsplash.com/photo-1668232164174-faf2e7329228?auto=format&fit=crop&w=400&q=80",
  "Idli Sambar": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80",
  "Pav Bhaji": "https://images.unsplash.com/photo-1606491956689-2ea866880049?auto=format&fit=crop&w=400&q=80",
  "Veg Thali": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
  "Rajma Chawal": "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=400&q=80",
  "Malai Kofta": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80",
  "Butter Naan": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
  "Garlic Naan": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",

  // Non-Veg
  "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
  "Mutton Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
  "Chicken Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80",
  "Chicken Noodles": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=400&q=80",
  "Butter Chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80",
  "Chicken Tikka Masala": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80",
  "Mutton Rogan Josh": "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=400&q=80",
  "Chicken Korma": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80",
  "Egg Bhurji": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80",
  "Keema Pav": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
  "Chicken Shawarma": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=400&q=80",
  "Mutton Seekh Kebab": "https://images.unsplash.com/photo-1599487488170-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80",
  "Fish Curry": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80",
  "Prawn Masala": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=400&q=80",
  "Egg Curry": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80",
  "Chicken Tikka": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80",

  // Drinks
  "Soft Drinks": "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=400&q=80",
  "Cold Coffee": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=400&q=80",
  "Mango Lassi": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80",
  "Fresh Lime Soda": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80",
  "Masala Chai": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=400&q=80",
  "Milkshake": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
  "Thandai": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",

  // Ice Cream
  "Ice Cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80",
  "Vanilla Ice Cream": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
  "Chocolate Ice Cream": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
  "Strawberry Ice Cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80",
  "Butterscotch Ice Cream": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
  "Kulfi": "https://images.unsplash.com/photo-1570197571499-166b36435e9f?auto=format&fit=crop&w=400&q=80",
  "Sundae": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",

  // Desserts
  "Chocolate Cake": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
  "Gulab Jamun": "https://images.unsplash.com/photo-1666190462623-43c5d6399ecd?auto=format&fit=crop&w=400&q=80",
  "Rasgulla": "https://images.unsplash.com/photo-1645177628172-a94c1f96e6d4?auto=format&fit=crop&w=400&q=80",
  "Jalebi": "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&w=400&q=80",
  "Panna Cotta": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
  "Brownie": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=400&q=80",
  "Tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80",
  "Cheesecake": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80",
  "Creme Brulee": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=400&q=80",
  "Phirni": "https://images.unsplash.com/photo-1571006046853-61c6c3e00c26?auto=format&fit=crop&w=400&q=80",
  "Halwa": "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&w=400&q=80",
  "Kheer": "https://images.unsplash.com/photo-1571006046853-61c6c3e00c26?auto=format&fit=crop&w=400&q=80",
  "Mango Pudding": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
  "Carrot Halwa": "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&w=400&q=80",
  "Shahi Tukda": "https://images.unsplash.com/photo-1666190462623-43c5d6399ecd?auto=format&fit=crop&w=400&q=80",
};

const FALLBACK_IMAGES = {
  "Starters": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80",
  "Veg": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
  "Non-Veg": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80",
  "Drinks": "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=400&q=80",
  "Ice Cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80",
  "Desserts": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
};

export function getFoodImage(name, category) {
  return FOOD_IMAGES[name] || FALLBACK_IMAGES[category] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
}
