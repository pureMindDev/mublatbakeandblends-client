import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import { IoLogoInstagram } from "react-icons/io5";
import { FiFacebook } from "react-icons/fi";
import { LuTwitter, LuDiamond } from "react-icons/lu";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">

        {/* LOGO */}
        <div className="footer-logo">
          <div className="logo">
            <span className="logoicon">
              <LuDiamond className="diamond-icon" />
            </span>
            <span className="brand-main">Mublat Bake & Blends</span>
          </div>
          <p className="footer-description">
            Crafting luxury moments through exquisite pastries
            and artisanal drinks since 2023.
          </p>
        </div>

        {/* SHOP */}
        <div className="footer-column">
          <h3>Shop</h3>
          <Link to="/menu">All Products</Link>
          <Link to="/menu">Pastries</Link>
          <Link to="/menu">Drinks</Link>
        </div>

        {/* SUPPORT */}
        <div className="footer-column">
          <h3>Support</h3>
          <Link to="/support">Help Centre</Link>
          <Link to="/support">Delivery Info</Link>
          <Link to="/support">Contact Us</Link>
          <Link to="/support">FAQs</Link>
        </div>

        {/* SOCIAL */}
        <div className="footer-column">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="icon">
              <IoLogoInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="icon">
              <FiFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="icon">
              <LuTwitter />
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2026 Mublat Bake & Blends. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/support">Privacy Policy</Link>
            <Link to="/support">Terms of Service</Link>
          </div>
          <p className="footer-credit">
            Website design by{" "}
            <a href="https://pureminddev.com/" target="_blank" rel="noreferrer">
              @PureMind
            </a>
          </p>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
