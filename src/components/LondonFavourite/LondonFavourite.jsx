import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./LondonFavourite.css";
import SafeImage from "../SafeImage/SafeImage";
import { fetchProducts } from "../../services/productService";

const normalise = (p) => ({
  id:    p._id || p.id,
  name:  p.name,
  image: p.images?.[0] || p.image || "",
  price: p.options?.[0]?.price ?? p.price ?? 0,
});

function LondonFavourites() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchProducts({ active: true, category: "Pastries", limit: 4 })
      .then(res => {
        const db = res.products?.map(normalise) || [];
        setItems(db.slice(0, 4));
      })
      .catch(() => setError(true));
  }, []);

  return (
    <section className="london">
      <div className="container">

        <h2 className="london-title">Mublat Favourites</h2>

        <p className="london-sub">
          Our most loved Nigerian drinks and homemade treats, made fresh and delivered across the UK.
        </p>

        {error ? (
          <p className="london-sub" style={{ textAlign: "center" }}>
            Couldn't load favourites right now — please try again shortly.
          </p>
        ) : (
          <div className="london-grid">
            {items.map((item) => (
              <Link
                to={`/product/${item.id}`}
                className="london-card"
                key={item.id}
              >
                <SafeImage src={item.image} alt={item.name} />
                <h4>{item.name}</h4>
                <p>£{Number(item.price).toFixed(2)}</p>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default LondonFavourites;
