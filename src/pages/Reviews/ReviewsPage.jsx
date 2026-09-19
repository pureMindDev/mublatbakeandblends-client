import React, { useState, useEffect } from "react";
import "./ReviewsPage.css";
import { FaStar, FaRegStar } from "react-icons/fa";
import api from "../../services/api";

const blankForm   = () => ({ name: "", rating: 0, text: "" });
const getInitials = name => name.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const fmtDate     = iso => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

function StarDisplay({ rating }) {
  return (
    <div className="rp-stars">
      {[1,2,3,4,5].map(s =>
        s <= rating
          ? <FaStar    key={s} className="star filled" />
          : <FaRegStar key={s} className="star empty"  />
      )}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  const labels  = ["","Poor","Fair","Good","Great","Excellent"];

  return (
    <div className="rp-star-picker">
      {[1,2,3,4,5].map(s => (
        <button
          key={s}
          type="button"
          className="rp-star-btn"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
        >
          {s <= display ? <FaStar className="rp-star-on" /> : <FaRegStar className="rp-star-off" />}
        </button>
      ))}
      {display > 0 && <span className="rp-star-label">{labels[display]}</span>}
    </div>
  );
}

function ReviewsPage() {
  const [reviews,  setReviews]  = useState([]);
  const [form,     setForm]     = useState(blankForm());
  const [errors,   setErrors]   = useState({});
  const [toast,    setToast]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Load real, customer-submitted reviews from the backend
  useEffect(() => {
    api.get("/reviews")
      .then(({ data }) => {
        setReviews(data.reviews || []);
      })
      .catch(() => {
        // Backend unavailable — reviews list stays empty
      });
  }, []);

  const setField = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name   = "Please enter your name.";
    if (form.rating === 0)              e.rating = "Please select a star rating.";
    if (!form.text.trim())              e.text   = "Please write your review.";
    else if (form.text.trim().length < 20) e.text = "Review must be at least 20 characters.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitting(true);
    setApiError("");

    try {
      const { data } = await api.post("/reviews", {
        name:   form.name.trim(),
        rating: form.rating,
        text:   form.text.trim(),
      });

      // Prepend newly saved review
      setReviews(prev => [data.review, ...prev]);
      setForm(blankForm());
      setErrors({});
      setToast(true);
      setTimeout(() => setToast(false), 3500);
      setTimeout(() => {
        document.getElementById("rp-grid-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="rp-page">

      <div className="rp-hero">
        <span className="rp-badge">Customer Reviews</span>
        <h1>The Mublat Experience</h1>
        <p>Don't just take our word for it. Join the thousands of Londoners who have discovered the gold standard of pastries.</p>
        {reviews.length > 0 && (
          <div className="rp-summary">
            <div className="rp-summary-score">
              <strong>{avgRating}</strong>
              <StarDisplay rating={Math.round(Number(avgRating))} />
              <span>Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        )}
      </div>

      {toast && <div className="rp-toast">✓ Your review has been posted! Thank you.</div>}

      <div className="rp-container">

        <div id="rp-grid-anchor" style={{ scrollMarginTop: "80px" }} />
        {reviews.length === 0 && (
          <p style={{ textAlign: "center", color: "#888", margin: "20px 0 40px" }}>
            No reviews yet — be the first to share your Mublat experience below!
          </p>
        )}
        <div className="rp-grid">
          {reviews.map(r => (
            <div key={r._id} className="rp-card">
              <StarDisplay rating={r.rating} />
              <p className="rp-text">"{r.text}"</p>
              <div className="rp-author">
                {r.image ? (
                  <img src={r.image} alt={r.name} className="rp-avatar" />
                ) : (
                  <div className="rp-avatar-initials">{getInitials(r.name)}</div>
                )}
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.role} · {fmtDate(r.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rp-form-section">
          <h2>Share Your Experience</h2>
          <p>We'd love to hear about your Mublat moment.</p>

          <div className="rp-form">
            <div className="rp-form-field">
              <label>Your Name</label>
              <input placeholder="e.g. Jane Doe" value={form.name} onChange={e => setField("name", e.target.value)} />
              {errors.name && <span className="rp-error">{errors.name}</span>}
            </div>

            <div className="rp-form-field">
              <label>Your Rating</label>
              <StarPicker value={form.rating} onChange={v => setField("rating", v)} />
              {errors.rating && <span className="rp-error">{errors.rating}</span>}
            </div>

            <div className="rp-form-field">
              <label>Your Review <span className="rp-char-count">{form.text.length} chars</span></label>
              <textarea
                placeholder="Tell us about your experience — what did you order and how was it?"
                value={form.text}
                onChange={e => setField("text", e.target.value)}
              />
              {errors.text && <span className="rp-error">{errors.text}</span>}
            </div>

            {apiError && <p className="rp-error" style={{ marginBottom: 8 }}>{apiError}</p>}

            <button className="rp-submit-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Posting…" : "Submit Review"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ReviewsPage;
