import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ChefSpecials.css";
import { fetchProducts } from "../../services/productService";

// Normalise DB product to a consistent display shape
const normalise = (p) => ({
  id:          p._id || p.id,
  name:        p.name,
  description: p.description || "",
  category:    p.category    || "Pastries",
  image:       p.images?.[0] || p.image || "",
  price:       p.options?.[0]?.price ?? p.price ?? 0,
});

function ChefSpecials() {
  const [specials, setSpecials] = useState([]);
  const [error, setError]       = useState(false);

  useEffect(() => {
    fetchProducts({ active: true, limit: 3 })
      .then(res => {
        const db = res.products?.map(normalise) || [];
        setSpecials(db.slice(0, 3));
      })
      .catch(() => setError(true));
  }, []);

  return (
    <section className="chef">
      <div className="container">

        <h2 className="chef-title">Chef Specials</h2>

        <p className="chef-sub">
          Explore our irresistible artisanal creations, handcrafted every
          morning using the world's finest ingredients.
        </p>

        <nav className="line"></nav>

        {error ? (
          <p className="chef-sub" style={{ textAlign: "center" }}>
            Couldn't load Chef Specials right now — please try again shortly.
          </p>
        ) : (
          <div className="chef-grid">
            {specials.map(item => (
              <div className="chef-card" key={item.id}>

                <span className="chef-tag">{item.category}</span>

                <img src={item.image} alt={item.name} />

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
        )}

        <div className="chef-view">
          <Link to="/menu" className="view-btn">View Full Menu</Link>
        </div>

      </div>
    </section>
  );
}

export default ChefSpecials;
