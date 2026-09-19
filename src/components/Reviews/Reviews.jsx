import React, { useEffect, useState } from "react";
import "./Reviews.css";
import { Link } from "react-router-dom";
import ReviewCard from "../ReviewCard/ReviewCard";
import api from "../../services/api";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    api.get("/reviews")
      .then(({ data }) => {
        // Show the 3 most recent real reviews left by customers
        setReviews((data.reviews || []).slice(0, 3));
      })
      .catch(() => { /* leave empty — section hides itself below */ })
      .finally(() => setLoaded(true));
  }, []);

  // Nothing real to show yet — don't display placeholder/fake reviews
  if (loaded && reviews.length === 0) return null;

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
