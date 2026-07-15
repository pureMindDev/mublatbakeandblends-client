import React, { useEffect, useState } from "react";
import "./Reviews.css";
import { Link } from "react-router-dom";
import ReviewCard from "../ReviewCard/ReviewCard";
import api from "../../services/api";

import review1 from "../../assets/images/review1.jpg";
import review2 from "../../assets/images/review2.jpg";
import review3 from "../../assets/images/review3.jpg";

// Fallback shown while loading or if API unavailable
const FALLBACK = [
  { _id: 1, name: "Aisha Khan",   role: "Customer", image: review1, rating: 5,
    text: "The pastries were absolutely delicious and arrived fresh. Highly recommended!" },
  { _id: 2, name: "David Smith",  role: "Customer", image: review2, rating: 5,
    text: "Loved the puff puff and tiger nut drink. Perfect for family gatherings." },
  { _id: 3, name: "Fatima Bello", role: "Customer", image: review3, rating: 5,
    text: "Beautiful presentation and amazing taste. Will definitely order again." },
];

function Reviews() {
  const [reviews, setReviews] = useState(FALLBACK);

  useEffect(() => {
    api.get("/reviews")
      .then(({ data }) => {
        if (data.reviews?.length >= 1) {
          // Show the 3 most recent, falling back per slot if fewer exist
          const latest = data.reviews.slice(0, 3);
          // Attach fallback avatar for reviews without an image
          const enriched = latest.map((r, i) => ({
            ...r,
            image: r.image || FALLBACK[i % FALLBACK.length].image,
          }));
          setReviews(enriched);
        }
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  return (
    <section className="reviews">
      <div className="container">

        <h2 className="reviews-title">The Mublat Experience</h2>

        <p className="reviews-sub">
          Don't just take our word for it. Join the thousands of Londoners
          who have discovered the gold standard of pastries.
        </p>

        <nav className="line"></nav>

        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <ReviewCard key={review._id || index} review={review} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "36px" }}>
          <Link to="/reviews" className="reviews-cta">
            Read All Reviews →
          </Link>
        </div>

      </div>
    </section>
  );
}

export default Reviews;
