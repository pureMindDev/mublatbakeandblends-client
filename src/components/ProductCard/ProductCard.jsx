import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import formatCurrency from "../../utils/formatCurrency";
import "./ProductCard.css";

function ProductCard({ product }) {
  const { addToCart }    = useContext(CartContext);
  const navigate         = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation(); // don't navigate when clicking the button

    addToCart({
      id:         product.id,
      name:       product.name,
      image:      product.image || "",
      optionName: product.options?.[0]?.label || product.options?.[0]?.name || "Standard",
      price:      product.options?.[0]?.price  || product.price || 0,
      quantity:   1,
    });

    // Brief "Added!" feedback, then reset
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ cursor: "pointer" }}
    >
      <img src={product.image} alt={product.name} />

      <div className="product-content">
        <h3>{product.name}</h3>
        <p className="price">{formatCurrency(product.price)}</p>

        <button
          className={`primary-btn ${added ? "added" : ""}`}
          onClick={handleAddToCart}
        >
          {added ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
