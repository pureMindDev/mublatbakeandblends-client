import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/images/mublat-logo.png";
import "./Navbar.css";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 3h3l2.5 12h11L21 7H6" />
    <circle cx="9" cy="20" r="1.6" />
    <circle cx="18" cy="20" r="1.6" />
  </svg>
);

/**
 * cartCount : number shown in the gold badge (pass it from your cart state/context)
 * onSearch  : optional click handler for the search icon
 */
function Navbar({ cartCount = 0, onSearch }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Transparent and floating over the hero on the home page, solid everywhere else
  const isHome = pathname === "/";

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link--active" : "nav-link";

  return (
    <header className={`navbar ${isHome ? "navbar--overlay" : "navbar--solid"}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          <img src={logo} alt="Mublat Bake & Blends" />
        </Link>

        <nav className={`navbar-links ${open ? "is-open" : ""}`} aria-label="Main">
          <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/menu" className={linkClass} onClick={() => setOpen(false)}>
            Menu
          </NavLink>
          <NavLink to="/reviews" className={linkClass} onClick={() => setOpen(false)}>
            Reviews
          </NavLink>
        </nav>

        <div className="navbar-actions">
          <button type="button" className="icon-btn" aria-label="Search" onClick={onSearch}>
            <SearchIcon />
          </button>

          <Link to="/cart" className="icon-btn cart-btn" aria-label={`Cart, ${cartCount} items`}>
            <CartIcon />
            <span className="cart-badge">{cartCount}</span>
          </Link>

          <Link to="/admin" className="admin-btn">
            Admin
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;