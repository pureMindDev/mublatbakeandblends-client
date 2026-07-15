import "./Success.css";
import { useContext, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { CartContext, getCachedImage } from "../../context/CartContext";

import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { MdAccessTime, MdOutlineFileDownload } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { LuCreditCard } from "react-icons/lu";
import { TiArrowRight } from "react-icons/ti";

function PaymentSuccess() {
  const { cartItems, clearCart } = useContext(CartContext);
  const { state } = useLocation();

  // Snapshot cart before it gets cleared
  const [orderItems] = useState(() => [...cartItems]);

  useEffect(() => { clearCart(); }, []); // eslint-disable-line

  // All data now comes from navigation state — no Stripe session fetch needed
  const orderRef = state?.orderRef || "—";
  const deliveryMethod = state?.deliveryMethod || "delivery";
  const deliveryFee = state?.deliveryFee ?? 3.50;
  const subtotal = state?.subtotal ?? orderItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const total = state?.total ?? subtotal + deliveryFee;
  const displayMethod = deliveryMethod === "pickup" ? "Pickup" : "Delivery";
  const isBankTransfer = state?.paymentMethod === "Bank Transfer";
  const bankDetails = state?.bankDetails;

  const handleReceipt = () => window.print();

  return (
    <section className="success-page">

      <div className="success-icon-wrapper">
        <div className="success-icon"><IoCheckmarkCircleOutline /></div>
      </div>

      <div className="success-badge">{isBankTransfer ? "Order Received — Payment Pending" : "Payment Confirmed"}</div>
      <h1>{isBankTransfer ? "Thanks — Your Order Is Reserved" : "Thank You for Your Order"}</h1>
      <p className="success-subtext">
        {isBankTransfer
          ? "We'll start preparing as soon as your bank transfer is received."
          : "Your delicious moment is being prepared."}
      </p>

      {isBankTransfer && bankDetails && (
        <div className="success-summary" style={{ marginBottom: 24 }}>
          <div className="summary-header"><h3>Bank Transfer Details</h3></div>
          <div className="summary-breakdown">
            <div><span>Account Name</span><span>{bankDetails.accountName}</span></div>
            <div><span>Bank</span><span>{bankDetails.bankName}</span></div>
            <div><span>Sort Code</span><span>{bankDetails.sortCode}</span></div>
            <div><span>Account No.</span><span>{bankDetails.accountNumber}</span></div>
            <div><span>Reference</span><span>{orderRef}</span></div>
          </div>
        </div>
      )}

      {/* INFO BAR */}
      <div className="success-info-bar">
        <div className="info-boxes">
          <nav className="info-icon"><MdAccessTime className="in-icon" /></nav>
          <nav className="info-box">
            <span>{displayMethod === "Pickup" ? "ESTIMATED PICKUP" : "ESTIMATED DELIVERY"}</span>
            <strong>{displayMethod === "Pickup" ? "15 Mins" : "45 – 60 Mins"}</strong>
            <small>Freshly Prepared</small>
          </nav>
        </div>

        <div className="info-boxes">
          <nav className="info-icon"><IoLocationOutline className="in-icon" /></nav>
          <nav className="info-box">
            <span>{displayMethod === "Pickup" ? "PICKUP FROM" : "DELIVERY TO"}</span>
            <strong>{displayMethod === "Pickup" ? "12 Mayfair Square" : "Your Address"}</strong>
            <small>{displayMethod === "Pickup" ? "London W1J 8AJ" : "Provided at Checkout"}</small>
          </nav>
        </div>

        <div className="info-boxes">
          <nav className="info-icon"><LuCreditCard className="in-icon" /></nav>
          <nav className="info-box">
            <span>ORDER ID</span>
            <strong>{orderRef}</strong>
            <small>Payment Successful</small>
          </nav>
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="success-summary">
        <div className="summary-header">
          <h3>Order Summary</h3>
          <span className="receipt" onClick={handleReceipt} style={{ cursor: "pointer" }}>
            <MdOutlineFileDownload className="re-icon" /> Receipt
          </span>
        </div>

        {orderItems.map((item, i) => (
          <div key={item.id + (item.optionName || "") + i} className="summary-row">
            <div className="item-left">
              {(() => {
                const src = item.image || getCachedImage(item.id, item.optionName);
                return src
                  ? <img src={src} alt={item.name} />
                  : (
                    <div className="item-img-fallback">
                      {item.name.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </div>
                  );
              })()}
              <div><p>{item.name}</p><span>Qty: {item.quantity}</span></div>
            </div>
            <div className="item-right">
              <strong>£{(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          </div>
        ))}

        <div className="summary-breakdown">
          <div><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
          <div>
            <span>{displayMethod === "Pickup" ? "Pickup" : "Delivery Fee"}</span>
            <span>{deliveryFee === 0 ? "FREE" : `£${deliveryFee.toFixed(2)}`}</span>
          </div>
        </div>

        <div className="success-total">
          <h3>Total</h3>
          <h4>£{total.toFixed(2)}</h4>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="success-bottom">
        <div className="track-box">
          <h4>Want to Track Live?</h4>
          <p>Follow your order's journey in real-time.</p>
          <Link
            to={orderRef !== "—" ? `/track?id=${encodeURIComponent(orderRef)}` : "/track"}
            className="track-btn"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
          >
            View Track Progress
          </Link>
        </div>
        <div className="browse-box">
          <h4>Keep Browsing</h4>
          <p>Explore more premium pastries and drinks.</p>
          <Link to="/menu">
            <button className="browse-btn">Back to Menu <TiArrowRight className="arrow" /></button>
          </Link>
        </div>
      </div>

      <div className="success-footer-links">
        <p>Something not right? <Link to="/support" style={{ color: "inherit" }}>Contact Support</Link></p>
        <div>
          <Link to="/">Return Home</Link>
          <Link to="/">Legal Policies</Link>
          <Link to="/reviews">Leave a Review</Link>
        </div>
      </div>

    </section>
  );
}

export default PaymentSuccess;