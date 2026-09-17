import "./Success.css";
import { useContext, useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { fetchOrderByOrderId } from "../../services/orderService";
import { BANK_DETAILS } from "../../utils/bankDetails";

import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { MdAccessTime, MdOutlineFileDownload } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { LuCreditCard } from "react-icons/lu";
import { TiArrowRight } from "react-icons/ti";
import Loader from "../../components/Loader/Loader";

function PaymentSuccess() {
  const { clearCart } = useContext(CartContext);
  const { state } = useLocation();
  const navigate = useNavigate();

  const orderRef = state?.orderRef || state?.orderId;

  // The order was already created server-side by Checkout — this page never
  // trusts the totals/items/bank details passed through navigation state.
  // It re-fetches the authoritative order from the backend by order number
  // (the same public endpoint used for order tracking).
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => { clearCart(); }, []); // eslint-disable-line

  useEffect(() => {
    if (!orderRef) {
      setLoading(false);
      setLoadError("We couldn't find your order details.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOrderByOrderId(orderRef);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) setLoadError("We couldn't find that order. Please check your email for confirmation, or contact support.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderRef]);

  const handleReceipt = () => window.print();

  if (loading) {
    return (
      <section className="success-page">
        <Loader />
      </section>
    );
  }

  if (loadError || !order) {
    return (
      <section className="success-page">
        <div className="success-icon-wrapper">
          <div className="success-icon"><IoCheckmarkCircleOutline /></div>
        </div>
        <h1>Order Submitted</h1>
        <p className="success-subtext">{loadError || "Your order has been received."}</p>
        <div className="success-bottom">
          <div className="browse-box">
            <h4>Something not right?</h4>
            <p>Contact support with your order details and we'll sort it out.</p>
            <Link to="/support"><button className="browse-btn">Contact Support <TiArrowRight className="arrow" /></button></Link>
          </div>
        </div>
      </section>
    );
  }

  const displayMethod = order.method === "Pickup" ? "Pickup" : "Delivery";
  const isPaid = order.paymentStatus === "Paid";
  const isBankTransfer = order.paymentMethod === "Bank Transfer";
  const subtotal = Number(order.totalAmount) - Number(order.deliveryFee || 0);

  return (
    <section className="success-page">

      <div className="success-icon-wrapper">
        <div className="success-icon"><IoCheckmarkCircleOutline /></div>
      </div>

      <div className="success-badge">{isPaid ? "Payment Confirmed" : "Order Received"}</div>
      <h1>{isPaid ? "Thank You for Your Order" : "Order Received"}</h1>
      <p className="success-subtext">
        Your order {order.orderId} has been received successfully.
      </p>
      <p className="success-subtext" style={{ marginTop: 4, fontWeight: 600 }}>
        Payment Status: {isPaid ? "Confirmed" : "Awaiting Bank Transfer"}
      </p>

      {!isPaid && isBankTransfer && (
        <div className="success-summary" style={{ marginBottom: 24 }}>
          <div className="summary-header"><h3>Bank Transfer Details</h3></div>
          <div className="summary-breakdown">
            <div><span>Bank</span><span>{BANK_DETAILS.bankName}</span></div>
            <div><span>Account Name</span><span>{BANK_DETAILS.accountName}</span></div>
            <div><span>Sort Code</span><span>{BANK_DETAILS.sortCode}</span></div>
            <div><span>Account No.</span><span>{BANK_DETAILS.accountNumber}</span></div>
            <div><span>Transfer Reference</span><span>{order.orderId}</span></div>
          </div>
          <p className="bank-note" style={{ marginTop: 12 }}>
            Please use <strong>{order.orderId}</strong> as your payment reference. Your order will move to
            preparation as soon as we confirm the transfer has been received — you'll get an email when that happens.
          </p>
        </div>
      )}

      {/* INFO BAR */}
      <div className="success-info-bar">
        <div className="info-boxes">
          <nav className="info-icon"><MdAccessTime className="in-icon" /></nav>
          <nav className="info-box">
            <span>{displayMethod === "Pickup" ? "ESTIMATED PICKUP" : "ESTIMATED DELIVERY"}</span>
            <strong>{displayMethod === "Pickup" ? "15 Mins" : "45 – 60 Mins"}</strong>
            <small>Once payment is confirmed</small>
          </nav>
        </div>

        <div className="info-boxes">
          <nav className="info-icon"><IoLocationOutline className="in-icon" /></nav>
          <nav className="info-box">
            <span>{displayMethod === "Pickup" ? "PICKUP FROM" : "DELIVERY TO"}</span>
            <strong>{displayMethod === "Pickup" ? "12 Mayfair Square" : "Your Address"}</strong>
            <small>{displayMethod === "Pickup" ? "London W1J 8AJ" : (order.address || "Provided at Checkout")}</small>
          </nav>
        </div>

        <div className="info-boxes">
          <nav className="info-icon"><LuCreditCard className="in-icon" /></nav>
          <nav className="info-box">
            <span>ORDER ID</span>
            <strong>{order.orderId}</strong>
            <small>{isPaid ? "Payment Confirmed" : "Awaiting Bank Transfer"}</small>
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

        {order.items?.map((item, i) => (
          <div key={(item.name || "") + (item.optionName || "") + i} className="summary-row">
            <div className="item-left">
              <div className="item-img-fallback">
                {item.name.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
              </div>
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
            <span>{Number(order.deliveryFee || 0) === 0 ? "FREE" : `£${Number(order.deliveryFee).toFixed(2)}`}</span>
          </div>
        </div>

        <div className="success-total">
          <h3>Total</h3>
          <h4>£{Number(order.totalAmount).toFixed(2)}</h4>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="success-bottom">
        <div className="track-box">
          <h4>Want to Track Live?</h4>
          <p>Follow your order's journey in real-time.</p>
          <Link
            to={`/track?id=${encodeURIComponent(order.orderId)}`}
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
            <button className="browse-btn" onClick={() => navigate("/menu")}>Back to Menu <TiArrowRight className="arrow" /></button>
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
