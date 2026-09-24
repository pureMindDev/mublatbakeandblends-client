import React, { useState, useContext, useEffect, useCallback } from "react";
import { CartContext } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../services/productService";
import { toastSuccess } from "../../utils/swal";

import "./Menu.css";

import { LuPlus } from "react-icons/lu";
import { CiSearch } from "react-icons/ci";
import { IoSwapVertical } from "react-icons/io5";
import Loader from "../../components/Loader/Loader";

/* Normalise a product coming back from the API (MongoDB) */
const normalise = (p) => ({
  id: p._id || p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  image: p.images?.[0] || p.image || "",
  price: p.options?.[0]?.price ?? p.price ?? 0,
  options: p.options || [],
});

function Menu() {

  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  /* ── Load products ── */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchProducts({ active: true, limit: 50 });
      setProducts(res.products.map(normalise));
    } catch {
      setProducts([]);
      setError("Couldn't load the menu right now — please refresh or try again shortly.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  /* ── Filter ── */
  let filtered = products.filter(p => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* ── Sort ── */
  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <section className="menu-page">
      <div className="container">

        <button className="menu-badge">Artisanal Menu</button>

        <h1 className="menu-title">
          Crafting Moments of <span> Pure Indulgence</span>
        </h1>

        <p className="menu-description">
          Explore our curated selection of hand-crafted pastries and specialty beverages.
          Each creation is born from tradition and elevated with the finest seasonal ingredients.
        </p>

        {/* Filters */}
        <div className="menu-filters">
          <nav className="filter-buttons">
            {["All", "Pastries", "Drinks", "Other"].map(cat => (
              <button
                key={cat}
                className={category === cat ? "active" : ""}
                onClick={() => { setCategory(cat); }}
              >
                {cat === "All" ? "All Items" : cat}
              </button>
            ))}
          </nav>

          <nav className="search-box">
            <div className="search-input-wrapper">
              <CiSearch className="search-icon" />
              <input
                type="search"
                placeholder="Search our collection..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="sort-input-wrapper">
              <IoSwapVertical className="sort-icon" />
              <select
                className="sort-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="default">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </nav>
        </div>

        <hr className="lines" />

        {/* States */}
        {loading && <Loader message="Loading menu…" />}

        {error && (
          <div className="menu-error">
            <p>{error}</p>
            <button onClick={loadProducts}>Try Again</button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="menu-grid">
            {filtered.length === 0 ? (
              <p className="no-results">No items match your search.</p>
            ) : (
              filtered.map(product => (
                <div key={product.id} className="menu-card">

                  <div className="menu-card-image">
                    {product.image
                      ? <img src={product.image} alt={product.name} />
                      : <div className="menu-card-no-img" />
                    }
                  </div>

                  <div className="menu-card-content">

                    <div className="menu-card-header">
                      <h3 className="menu-card-name">{product.name}</h3>
                      <span className="menu-card-category">{product.category}</span>
                    </div>

                    <p className="menu-card-description">{product.description}</p>

                    <Link to={`/product/${product.id}`} className="chef-btn">
                      View Details
                    </Link>

                    <div className="menu-card-footer">
                      <span className="menu-card-price">
                        Starting from <strong>£{product.price.toFixed(2)}</strong>
                      </span>

                      <button
                        className="menu-card-plus"
                        onClick={() => {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            image: product.image,
                            optionName: product.options?.[0]?.label || product.options?.[0]?.name || "Standard",
                            price: product.options?.[0]?.price || product.price,
                            quantity: 1,
                          });
                          toastSuccess(`${product.name} added to cart!`);
                        }}
                      >
                        <LuPlus />
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </section>
  );
}

export default Menu;