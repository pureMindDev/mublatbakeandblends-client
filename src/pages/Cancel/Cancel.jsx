import "./Cancel.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { LuShieldCheck, LuRefreshCw } from "react-icons/lu";

function PaymentCancelled() {

  const { cartItems } = useContext(CartContext);

  /* Stripe passes session_id even on cancel in some flows */
  // const sessionId = searchParams.get("session_id");

  const itemCount = cartItems.reduce((t, i) => t + i.quantity, 0);
  const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <section className="cancel-page">

      <div className="cancel-card">

        {/* ICON */}
        <div className="cancel-icon-wrapper">
          <div className="cancel-icon">✕</div>
        </div>

        {/* TITLE */}
        <h2>PAYMENT CANCELLED</h2>

        {/* TEXT */}
        <p>
          Your transaction was not completed. No funds have been debited
          from your account. Your cart is still saved — you can return and
          try again whenever you're ready.
        </p>

        {/* CART SUMMARY (if items still in cart) */}
        {itemCount > 0 && (
          <div className="cancel-cart-summary">
            <span className="cancel-cart-label">Your cart</span>
            <span className="cancel-cart-value">
              {itemCount} item{itemCount !== 1 ? "s" : ""} · £{subtotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* MINI CARDS */}
        <div className="cancel-actions">
          <div className="cancel-mini">
            <LuRefreshCw className="cancel-mini-icon" />
            <strong>RETRY</strong>
            <span>Go back to cart &amp; try again</span>
          </div>
          <div className="cancel-mini">
            <LuShieldCheck className="cancel-mini-icon" />
            <strong>SECURE</strong>
            <span>Your data is always safe with us</span>
          </div>
        </div>

        {/* BUTTONS */}
        <Link to="/cart" className="cancel-btn">
          ← Return to Cart
        </Link>

        <Link to="/checkout" className="cancel-btn-secondary">
          Try Checkout Again
        </Link>

        <Link to="/" className="cancel-link">
          Return to Homepage
        </Link>

      </div>

      {/* HELP */}
      <div className="cancel-help">
        <h4>NEED ASSISTANCE?</h4>
        <p>
          If you continue to have trouble with payments, please visit our{" "}
          <Link to="/support" className="cancel-support-link">support page</Link>{" "}
          or email us at{" "}
          <a href="mailto:support@mublat.com" className="cancel-support-link">
            support@mublat.com
          </a>
        </p>
      </div>

    </section>
  );
}

export default PaymentCancelled;
