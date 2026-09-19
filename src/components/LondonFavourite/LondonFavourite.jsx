import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./LondonFavourite.css";
import { fetchProducts } from "../../services/productService";
import { products as localProducts } from "../../data/products";

const normalise = (p) => ({
  id:    p._id || p.id,
  name:  p.name,
  image: p.images?.[0] || p.image || "",
  price: p.options?.[0]?.price ?? p.price ?? 0,
});

function LondonFavorites() {
  // Same fix as ChefSpecials: don't seed with the bundled placeholder
  // products, or they'll flash on screen for a moment before the real
  // fetch replaces them on every page load/refresh.
  const [items, setItems]   = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchProducts({ active: true, category: "Pastries", limit: 4 })
      .then(res => {
        const db = res.products?.map(normalise) || [];
        setItems(db.length > 0 ? db.slice(0, 4) : localProducts.filter(p => p.category === "Pastries").slice(0, 4));
      })
      .catch(() => {
        setItems(localProducts.filter(p => p.category === "Pastries").slice(0, 4));
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className="london">
      <div className="container">

        <h2 className="london-title">London's Favorites</h2>

        <p className="london-sub">
          The treats that keep the city coming back. Most loved by our community.
        </p>

        <div className="london-grid">
          {loaded && items.map((item) => (
            <Link
              to={`/product/${item.id}`}
              className="london-card"
              key={item.id}
            >
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <h4>{item.name}</h4>
              <p>£{Number(item.price).toFixed(2)}</p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default LondonFavorites;