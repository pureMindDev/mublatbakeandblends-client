import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import { FaFacebookF, FaTiktok } from "react-icons/fa6";
import logo from "../../assets/images/mublat-logo.png";

// The business's official profiles (client-provided).
const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61595473896203",
    Icon: FaFacebookF,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@mublatbakesandblends?_r=1&_t=ZN-9Aw6i2dK6QY",
    Icon: FaTiktok,
  },
];

function Footer() {
  return (
    <footer className="footer" aria-label="Site footer">
      <div className="footer-glow" aria-hidden="true" />

      <div className="container footer-container">

        {/* BRAND */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo-link" aria-label="Mublat Bake & Blends — home">
            <img src={logo} alt="" className="footer-logo-img" width="64" height="64" />
            <span className="footer-brand-text">
              <span className="brand-main">Mublat</span>
              <span className="brand-sub">Bake &amp; Blends</span>
            </span>
          </Link>
          <p className="footer-description">
            Crafting luxury moments through exquisite pastries
            and artisanal drinks since 2023.
          </p>

          <div className="footer-social">
            <h3 className="footer-social-title">Follow us</h3>
            <ul className="social-icons">
              {SOCIAL_LINKS.map(({ name, href, Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={`Mublat Bake & Blends on ${name} (opens in a new tab)`}
                  >
                    <Icon className="social-link-icon" aria-hidden="true" />
                    <span>{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SHOP */}
        <nav className="footer-column" aria-label="Shop">
          <h3>Shop</h3>
          <Link to="/menu">All Products</Link>
          <Link to="/menu">Pastries</Link>
          <Link to="/menu">Drinks</Link>
          <Link to="/reviews">Reviews</Link>
        </nav>

        {/* SUPPORT */}
        <nav className="footer-column" aria-label="Support">
          <h3>Support</h3>
          <Link to="/support">Help Centre</Link>
          <Link to="/support#delivery">Delivery Info</Link>
          <Link to="/track">Track Your Order</Link>
          <Link to="/support">Contact Us</Link>
          <Link to="/support">FAQs</Link>
        </nav>

        {/* ORDERING */}
        <div className="footer-column footer-facts">
          <h3>Ordering</h3>
          <p>Delivered across the UK</p>
          <p>Free pickup available</p>
          <p>Secure bank-transfer payment</p>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2026 Mublat Bake &amp; Blends. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <p className="footer-credit">
            Website design by{" "}
            <a href="https://pureminddev.com/" target="_blank" rel="noopener noreferrer">
              @PureMind
            </a>
          </p>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
