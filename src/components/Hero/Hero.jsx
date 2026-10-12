import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

/* Small inline icons so no extra dependency is needed */
const LeafIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 4c-9 0-15 4-15 11 0 1.5.4 2.8 1 3.8C7.2 19.6 8.5 20 10 20c7 0 10-6 10-16z" />
    <path d="M4 21c2-5 5-8.5 10-11" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const TruckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 6h11v10H2z" />
    <path d="M13 9h4l4 4v3h-8z" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
    <path d="M1 9h4M3 12h3" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          {/* Badge */}
          <span className="hero-badge">The Art of Fine Pastry</span>

          {/* Title */}
          <h1 className="hero-title">
            <span className="hero-title-main">
              Mublat
              <LeafIcon className="hero-title-leaf" />
            </span>
            <span className="hero-title-script">Pastries &amp; Drinks</span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            From refreshing homemade drinks to delicious Nigerian pastries, we bring you comforting, authentic flavours made with carefully selected ingredients.
          </p>

          {/* Buttons */}
          <div className="hero-buttons">
            <Link to="/menu" className="primary-btn">
              Order Now
              <span className="btn-arrow">
                <ArrowIcon />
              </span>
            </Link>

            <Link to="/menu" className="secondary-btn">
              Explore Menu
            </Link>
          </div>

          {/* Trust row */}
          <ul className="hero-features">
            <li>
              <LeafIcon className="feature-icon" />
              <span>
                Freshly
                <br />
                Made
              </span>
            </li>
            <li>
              <span className="feature-icon">
                <ShieldIcon />
              </span>
              <span>
                Quality
                <br />
                Ingredients
              </span>
            </li>
            <li>
              <span className="feature-icon">
                <TruckIcon />
              </span>
              <span>
                Fast
                <br />
                Delivery
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Hero;