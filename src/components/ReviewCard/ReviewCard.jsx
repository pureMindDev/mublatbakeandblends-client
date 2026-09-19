import React from "react";
import "./ReviewCard.css";
import { FaStar } from "react-icons/fa";

const getInitials = (name = "") =>
  name.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

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

      {review.image ? (
        <img
          src={review.image}
          alt={review.name}
          className="review-image"
        />
      ) : (
        <div className="review-image review-image-initials">
          {getInitials(review.name)}
        </div>
      )}

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