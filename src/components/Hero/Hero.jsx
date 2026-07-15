import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-overlay">

        {/* Top Badge */}
        <span className="hero-badge">
          The Art of Fine Pastry
        </span>

        {/* Main Brand Title */}
        <h1 className="hero-title">
          Mublat
        </h1>

        {/* Description */}
        <p className="hero-description">
          Where gold-standard ingredients meet artisanal craftsmanship.
          Delivered fresh to your doorstep.
        </p>

        {/* Buttons */}
        <div className="hero-buttons">

          <Link to="/menu" className="primary-btn">
            Order Now
          </Link>

          <Link to="/menu" className="secondary-btn">
            Explore Menu
          </Link>

        </div>

      </div>

    </section>
  );
}

export default Hero;
