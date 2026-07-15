import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { Link, useLocation } from "react-router-dom";
import { LuShoppingBag, LuDiamond, LuMenu, LuX } from "react-icons/lu";
import "./Navbar.css";

function Navbar() {
  const { cartItems } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  /* Close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [location]);

  /* Prevent body scroll when menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header className="navbar">

      {/* LEFT NAV — desktop */}
      <nav className="nav-left">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/menu">Menu</Link></li>
          <li><Link to="/reviews">Reviews</Link></li>
        </ul>
      </nav>

      {/* CENTER LOGO */}
      <Link to="/" className="logo">
        <span className="logoicon">
          <LuDiamond className="diamond-icon" />
        </span>
        <span className="brand-main">Mublat Bake & Blends</span>
      </Link>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        <Link to="/cart" className="cart-link">
          <LuShoppingBag className="cart-icon" />
          {cartItems.length > 0 && (
            <span className="cart-count">{cartItems.length}</span>
          )}
        </Link>

        <Link to="/admin" className="adminbtn">Admin</Link>

        {/* HAMBURGER — mobile only */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <LuX /> : <LuMenu />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="mobile-drawer" onClick={e => e.stopPropagation()}>

            <div className="mobile-drawer-logo">
              <LuDiamond className="diamond-icon" />
              <span>Mublat</span>
            </div>

            <ul className="mobile-nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/reviews">Reviews</Link></li>
              <li><Link to="/cart">
                Cart
                {cartItems.length > 0 && (
                  <span className="mobile-cart-badge">{cartItems.length}</span>
                )}
              </Link></li>
            </ul>

            <Link to="/admin" className="mobile-admin-btn">
              Admin Dashboard
            </Link>

          </nav>
        </div>
      )}

    </header>
  );
}

export default Navbar;