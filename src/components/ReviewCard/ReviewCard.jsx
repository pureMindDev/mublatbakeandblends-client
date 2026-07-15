import React from "react";
import "./ReviewCard.css";
import { FaStar } from "react-icons/fa";

function ReviewCard({ review }) {

  return (

    <div className="review-card">

      {/* Stars */}

      <div className="review-stars">

        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="star-icon" />
        ))}

      </div>

      {/* Review Text */}

      <p className="review-text">
        "{review.text}"
      </p>

      {/* Profile Image */}

      <img
        src={review.image}
        alt={review.name}
        className="review-image"
      />

      {/* Name */}

      <h4 className="review-name">
        {review.name}
      </h4>

      {/* Role */}

      <p className="review-role">
        {review.role}
      </p>

    </div>

  );
}

export default ReviewCard;