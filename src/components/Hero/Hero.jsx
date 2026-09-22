import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-overlay">

        {/* Top Badge */}
        <span className="hero-badge">
          Authentic Nigerian Flavours, Made with Love.
        </span>

        {/* Main Brand Title */}
        <h1 className="hero-title">
          Mublat
        </h1>

        {/* Description */}
        <p className="hero-description">
          From refreshing homemade drinks to delicious Nigerian pastries,
          we bring you comforting, authentic flavours made with carefully
          selected ingredients.
        </p>
        <p className="hero-description">
          🥤 Natural Drinks &nbsp;|&nbsp; 🥐 Homemade Pastries &nbsp;|&nbsp; 📦 Delivery Available
        </p>

        {/* Buttons */}
        <div className="hero-buttons">

          <Link to="/menu" className="primary-btn">
            Order Now
          </Link>

          <Link to="/menu" className="secondary-btn">
            Explore Our Menu
          </Link>

        </div>

      </div>

    </section>
  );
}

export default Hero;
