import React, { useState, useContext, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger, staggerItem, pageTransition } from "../../utils/motion";
import { toastSuccess } from "../../utils/swal";
import { CartContext } from "../../context/CartContext";
import { fetchProductById, fetchProducts } from "../../services/productService";
import Loader from "../../components/Loader/Loader";

import { LuPlus, LuMinus, LuShoppingBag, LuCheck } from "react-icons/lu";
import { FaStar, FaRegStar } from "react-icons/fa";
import "./ProductDetails.css";

const RATINGS = {
  1:{ score:4.9,count:124 }, 2:{ score:4.8,count:98  },
  3:{ score:4.7,count:76  }, 4:{ score:4.9,count:112 },
  5:{ score:4.8,count:89  }, 6:{ score:4.6,count:54  },
  7:{ score:4.9,count:143 }, 8:{ score:4.7,count:67  },
};

/* Which category to suggest as a pairing for a given product's category.
 * Pastries <-> Drinks pair with each other; "Other" (or anything else)
 * falls back to Pastries as a sensible default complement. */
const getPairedCategory = (category) => {
  if (category === "Pastries") return "Drinks";
  if (category === "Drinks") return "Pastries";
  return "Pastries";
};

function StarDisplay({ score }) {
  return (
    <div className="rating">
      {[1,2,3,4,5].map(s =>
        s <= Math.round(score)
          ? <FaStar    key={s} className="star-filled" />
          : <FaRegStar key={s} className="star-empty"  />
      )}
    </div>
  );
}

const normalise = (p) => ({
  id:              p._id   || p.id,
  name:            p.name,
  description:     p.description,
  fullDescription: p.fullDescription || p.description,
  category:        p.category,
  images:          p.images?.length ? p.images : [p.image].filter(Boolean),
  ingredients:     p.ingredients || [],
  options:         (p.options || []).map(o => ({ name: o.label || o.name, price: o.price })),
  price:           p.options?.[0]?.price ?? p.price ?? 0,
});

function ProductDetails() {
  const { id }        = useParams();
  const { addToCart } = useContext(CartContext);

  const [product,        setProduct]        = useState(null);
  const [paired,         setPaired]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [mainImage,      setMainImage]      = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity,       setQuantity]       = useState(1);
  const [added,          setAdded]          = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(""); setAdded(false);
      let prod;
      try {
        prod = normalise(await fetchProductById(id));
      } catch {
        setError("Couldn't load this product right now — please try again shortly.");
        setLoading(false);
        return;
      }
      setProduct(prod);
      setMainImage(prod.images[0] || "");
      setSelectedOption(prod.options[0] || null);
      setQuantity(1);
      try {
        const opp = getPairedCategory(prod.category);
        const res = await fetchProducts({ category: opp, limit: 4, active: true });
        setPaired(res.products.map(normalise).slice(0, 4));
      } catch {
        setPaired([]);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <Loader message="Loading product…" />;
  if (error || !product) return (
    <section className="product-details">
      <div className="container" style={{ textAlign:"center", padding:"80px 0" }}>
        <h2 style={{ color:"white", marginBottom:20 }}>{error || "Product not found"}</h2>
        <Link to="/menu" className="add-cart-btn" style={{ textDecoration:"none" }}>Back to Menu</Link>
      </div>
    </section>
  );

  const numericId = typeof product.id === "number" ? product.id : undefined;
  const rating    = RATINGS[numericId] || { score: 4.8, count: 80 };

  const handleAddToCart = () => {
    addToCart({
      id:         product.id,
      name:       product.name,
      image:      product.images[0] || "",
      optionName: selectedOption?.name || "Standard",
      price:      selectedOption?.price || product.price,
      quantity,
    });
    setAdded(true);
    toastSuccess(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 2200);
  };

  const handlePairedAdd = (item) => {
    addToCart({
      id: item.id, name: item.name, image: item.images[0]||"",
      optionName: item.options[0]?.name||"Standard",
      price: item.options[0]?.price||item.price, quantity:1,
    });
    toastSuccess(`${item.name} added to cart!`);
  };

  return (
    <motion.section
      className="product-details"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      key={product.id}
    >
      <div className="container details-grid">

        {/* IMAGES */}
        <div className="image-section">
          <div className="main-image-wrapper">
            <div className="badge-list">
              <span className="badge">Best Seller</span>
              <span className="badge">Artisanal</span>
              <span className="badge">Limited Edition</span>
            </div>
            <AnimatePresence mode="wait">
              {mainImage && (
                <motion.img
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  className="main-image"
                  initial={{ opacity:0, scale:1.03 }}
                  animate={{ opacity:1, scale:1 }}
                  exit={{ opacity:0 }}
                  transition={{ duration:0.25 }}
                />
              )}
            </AnimatePresence>
          </div>
          {product.images.length > 1 && (
            <div className="thumbnail-row">
              {product.images.map((img, i) => (
                <motion.img
                  key={i} src={img} alt=""
                  className={mainImage===img?"thumb active":"thumb"}
                  onClick={() => setMainImage(img)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="product-info">
          <div className="rating-row">
            <StarDisplay score={rating.score} />
            <span className="rating-text">{rating.score} ({rating.count} reviews)</span>
          </div>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-description">{product.fullDescription}</p>

          {product.options.length > 0 && (
            <>
              <h4 className="section-title">SELECT OPTION</h4>
              <div className="price-options">
                {product.options.map((opt, i) => (
                  <motion.div
                    key={i}
                    className={selectedOption?.name===opt.name?"option active":"option"}
                    onClick={() => setSelectedOption(opt)}
                    whileTap={{ scale: 0.97 }}
                  >
                    <p>{opt.name?.toUpperCase()}</p>
                    <strong>£{opt.price.toFixed(2)}</strong>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          <h4 className="section-title">QUANTITY</h4>
          <div className="qty-box">
            <button onClick={() => setQuantity(q => q>1?q-1:1)}><LuMinus /></button>
            <motion.span key={quantity} initial={{ scale:1.3 }} animate={{ scale:1 }} transition={{ duration:0.15 }}>
              {quantity}
            </motion.span>
            <button onClick={() => setQuantity(q => q+1)}><LuPlus /></button>
          </div>

          <motion.button
            className={`add-cart-btn ${added?"added":""}`}
            onClick={handleAddToCart}
            whileTap={{ scale: 0.97 }}
            animate={added ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {added
              ? <><LuCheck /> Added to Cart!</>
              : <><LuShoppingBag /> Add to Cart — £{((selectedOption?.price||product.price)*quantity).toFixed(2)}</>
            }
          </motion.button>

          {product.ingredients.length > 0 && (
            <div className="ingredients-section">
              <h3>Craftsmanship & Ingredients</h3>
              <ul>{product.ingredients.map((item,i) => <li key={i}>{item}</li>)}</ul>
            </div>
          )}
        </div>
      </div>

      {paired.length > 0 && (
        <motion.div
          className="paired-section container"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="paired-header">
            <div>
              <h2 className="paired-title">Perfectly Paired</h2>
              <p className="paired-sub">{getPairedCategory(product.category)==="Drinks"?"Exquisite drinks to complement your selection.":"Delicious pastries to complement your selection."}</p>
            </div>
          </div>
          <motion.div className="paired-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            {paired.map(item => (
              <motion.div key={item.id} className="paired-card" variants={staggerItem} whileHover={{ y: -4 }}>
                <div className="paired-image"><img src={item.images[0]||""} alt={item.name} /></div>
                <div className="paired-content">
                  <h4>{item.name}</h4>
                  <p>£{item.price.toFixed(2)}</p>
                  <div className="paired-actions">
                    <Link to={`/product/${item.id}`} className="paired-view-btn">View</Link>
                    <button className="paired-add-btn" onClick={() => handlePairedAdd(item)}>+</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  );
}

export default ProductDetails;
