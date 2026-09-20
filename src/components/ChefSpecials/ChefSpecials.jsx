import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ChefSpecials.css";
import { fetchProducts } from "../../services/productService";
import { products as localProducts } from "../../data/products";

// Normalise DB product to the same shape as local products
const normalise = (p) => ({
  id:          p._id || p.id,
  name:        p.name,
  description: p.description || "",
  category:    p.category    || "Pastries",
  image:       p.images?.[0] || p.image || "",
  price:       p.options?.[0]?.price ?? p.price ?? 0,
});

function ChefSpecials() {
  // Start empty rather than pre-filling with the bundled placeholder
  // products — seeding with local data here is what caused the old
  // "wrong products flash for a moment on every refresh" bug, since
  // this state briefly rendered before the real DB fetch replaced it.
  const [specials, setSpecials] = useState([]);
  const [loaded, setLoaded]     = useState(false);

  useEffect(() => {
    fetchProducts({ active: true, limit: 3 })
      .then(res => {
        const db = res.products?.map(normalise) || [];
        setSpecials(db.length > 0 ? db.slice(0, 3) : localProducts.slice(0, 3));
      })
      .catch(() => {
        // Only fall back to local/bundled data if the real fetch failed.
        setSpecials(localProducts.slice(0, 3));
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className="chef">
      <div className="container">

        <h2 className="chef-title">Chef Specials</h2>

        <p className="chef-sub">
          Freshly made drinks, homemade pastries & wholesome treats, crafted with natural ingredients and lots of love.
        </p>

        <nav className="line"></nav>

        <div className="chef-grid">
          {loaded && specials.map(item => (
            <div className="chef-card" key={item.id}>

              <span className="chef-tag">{item.category}</span>

              <img
                src={item.image}
                alt={item.name}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />

              <div className="chef-content">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <h4>£{Number(item.price).toFixed(2)}</h4>
                <Link to={`/product/${item.id}`} className="chef-btn">
                  View Details
                </Link>
              </div>

            </div>
          ))}
        </div>

        <div className="chef-view">
          <Link to="/menu" className="view-btn">View Full Menu</Link>
        </div>

      </div>
    </section>
  );
}

export default ChefSpecials;