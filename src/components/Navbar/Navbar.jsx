import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LuShoppingBag, LuSearch, LuMenu, LuX } from "react-icons/lu";
import logo from "../../assets/images/mublat-logo.png";
import useScrollDirection from "../../hooks/useScrollDirection";
import "./Navbar.css";

function Navbar() {
  const { cartItems } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  /* Transparent over the hero on the home page, solid bar everywhere else */
  const isHome = location.pathname === "/";

  /* Hide on scroll down, reveal on any scroll up. On the home page the bar is
     transparent only near the top; once scrolled it becomes the compact solid
     bar (so the tall hanging logo never covers content). */
  const { atTop, hidden } = useScrollDirection({
    topOffset: isHome ? 60 : 8,
    disabled: menuOpen,
  });
  const [focusShown, setFocusShown] = useState(false);
  useEffect(() => { setFocusShown(false); }, [hidden]);
  const overlayMode = isHome && atTop;

  /* Close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [location]);

  /* Prevent body scroll when menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link--active" : "nav-link";

  return (
    <header
      className={
        `navbar ${overlayMode ? "navbar--overlay" : "navbar--solid"}` +
        `${isHome ? " navbar--fixed" : ""}` +
        `${hidden && !menuOpen && !focusShown ? " navbar--hidden" : ""}`
      }
      /* keyboard users tabbing into a hidden header bring it back */
      onFocusCapture={() => setFocusShown(true)}
    >
      <div className="navbar-inner">

        {/* LOGO — left */}
        <Link to="/" className="navbar-logo" aria-label="Mublat Bake & Blends — home">
          <img src={logo} alt="Mublat Bake & Blends" />
        </Link>

        {/* LINKS — center, desktop */}
        <nav className="navbar-links" aria-label="Main">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/menu" className={linkClass}>Menu</NavLink>
          <NavLink to="/reviews" className={linkClass}>Reviews</NavLink>
        </nav>

        {/* RIGHT SIDE */}
        <div className="navbar-actions">
          <button
            type="button"
            className="nav-icon"
            aria-label="Search the menu"
            onClick={() => navigate("/menu")}
          >
            <LuSearch />
          </button>

          <Link
            to="/cart"
            className="nav-icon nav-cart"
            aria-label={`Cart, ${cartItems.length} items`}
          >
            <LuShoppingBag />
            <span className="nav-cart-badge">{cartItems.length}</span>
          </Link>

          <Link to="/admin" className="adminbtn">Admin</Link>

          {/* HAMBURGER — mobile only */}
          <button
            type="button"
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <LuX /> : <LuMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="mobile-drawer" onClick={(e) => e.stopPropagation()}>

            <div className="mobile-drawer-logo">
              <img src={logo} alt="" />
              <span>Mublat Bake & Blends</span>
            </div>

            <ul className="mobile-nav-links">
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/menu">Menu</NavLink></li>
              <li><NavLink to="/reviews">Reviews</NavLink></li>
              <li>
                <NavLink to="/cart">
                  Cart
                  {cartItems.length > 0 && (
                    <span className="mobile-cart-badge">{cartItems.length}</span>
                  )}
                </NavLink>
              </li>
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