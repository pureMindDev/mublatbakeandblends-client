import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./OrderTracking.css";
import api from "../../services/api";
import {
  LuSearch, LuCheck, LuClock, LuPackage,
  LuTruck, LuHouse, LuX,
} from "react-icons/lu";

/* Status steps in order */
const STEPS = [
  { key: "Pending",          icon: <LuClock />,   label: "Order Received",  desc: "Your order has been placed and is awaiting preparation." },
  { key: "Preparing",        icon: <LuPackage />, label: "Preparing",       desc: "Our team is carefully preparing your items fresh." },
  { key: "Out for Delivery", icon: <LuTruck />,   label: "Out for Delivery",desc: "Your order is on its way to you!" },
  { key: "Delivered",        icon: <LuCheck />,   label: "Delivered",       desc: "Your order has arrived. Enjoy!" },
];

const stepIndex = (status) => STEPS.findIndex(s => s.key === status);

function OrderTracking() {

  const [searchParams, setSearchParams] = useSearchParams();

  const [inputId, setInputId]   = useState(searchParams.get("id") || "");
  const [order,   setOrder]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");
  const [searched, setSearched] = useState(false);

  /* Auto-search if ?id= is in URL on load */
  React.useEffect(() => {
    const id = searchParams.get("id");
    if (id) handleSearch(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (id) => {
    const orderId = (id || inputId).trim();
    if (!orderId) { setError("Please enter an order ID."); return; }

    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    try {
      /* Public endpoint — no auth needed */
      const { data } = await api.get(`/orders/track/${encodeURIComponent(orderId)}`);
      setOrder(data.order);
      setSearchParams({ id: orderId });
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`No order found with ID "${orderId}". Please check and try again.`);
      } else {
        setError("Could not fetch order. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? stepIndex(order.status) : -1;
  const isCancelled = order?.status === "Cancelled";

  return (
    <section className="ot-page">

      {/* HERO */}
      <div className="ot-hero">
        <span className="ot-badge">Order Tracking</span>
        <h1>Track Your Order</h1>
        <p>Enter your order ID to see its current status and estimated delivery time.</p>
      </div>

      <div className="ot-container">

        {/* SEARCH BAR */}
        <div className="ot-search-wrap">
          <div className="ot-search-box">
            <LuSearch className="ot-search-icon" />
            <input
              placeholder="Enter your Order ID (e.g. ORD-9281)"
              value={inputId}
              onChange={e => { setInputId(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            {inputId && (
              <button
                className="ot-clear-btn"
                onClick={() => { setInputId(""); setOrder(null); setSearched(false); setError(""); setSearchParams({}); }}
              >
                <LuX />
              </button>
            )}
          </div>
          <button
            className="ot-track-btn"
            onClick={() => handleSearch()}
            disabled={loading}
          >
            {loading ? "Searching…" : "Track Order"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="ot-error">
            <LuX className="ot-error-icon" />
            {error}
          </div>
        )}

        {/* ORDER RESULT */}
        {order && !isCancelled && (
          <div className="ot-result">

            {/* ORDER META */}
            <div className="ot-meta-bar">
              <div className="ot-meta-item">
                <span>ORDER ID</span>
                <strong>{order.orderId || order._id}</strong>
              </div>
              <div className="ot-meta-item">
                <span>CUSTOMER</span>
                <strong>{order.customerName}</strong>
              </div>
              <div className="ot-meta-item">
                <span>METHOD</span>
                <strong>{order.method}</strong>
              </div>
              <div className="ot-meta-item">
                <span>TOTAL</span>
                <strong>£{Number(order.totalAmount).toFixed(2)}</strong>
              </div>
            </div>

            {/* STATUS TIMELINE */}
            <div className="ot-timeline">
              {STEPS.map((step, i) => {
                const done    = i <= currentStep;
                const active  = i === currentStep;
                return (
                  <div key={step.key} className={`ot-step ${done ? "done" : ""} ${active ? "active" : ""}`}>

                    {/* Connector line */}
                    {i > 0 && (
                      <div className={`ot-connector ${i <= currentStep ? "done" : ""}`} />
                    )}

                    {/* Circle */}
                    <div className="ot-circle">
                      {done ? <LuCheck /> : step.icon}
                    </div>

                    {/* Label */}
                    <div className="ot-step-info">
                      <strong>{step.label}</strong>
                      {active && <p>{step.desc}</p>}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* ETA */}
            <div className="ot-eta">
              {order.status === "Pending" && (
                <p>⏱ Your order is confirmed and will start being prepared shortly.</p>
              )}
              {order.status === "Preparing" && (
                <p>👨‍🍳 Your items are being freshly prepared. Estimated ready in 15–20 mins.</p>
              )}
              {order.status === "Out for Delivery" && (
                <p>🛵 Your order is on the way! Estimated arrival in 20–30 mins.</p>
              )}
              {order.status === "Delivered" && (
                <p>✅ Your order has been delivered. We hope you enjoyed it!</p>
              )}
            </div>

            {/* ITEMS */}
            {order.items?.length > 0 && (
              <div className="ot-items">
                <h4>Order Items</h4>
                {order.items.map((item, i) => (
                  <div key={i} className="ot-item-row">
                    <span>{item.quantity}× {item.name} ({item.optionName || "Standard"})</span>
                    <strong>£{(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                ))}
                <div className="ot-items-total">
                  <span>Total</span>
                  <strong>£{Number(order.totalAmount).toFixed(2)}</strong>
                </div>
              </div>
            )}

          </div>
        )}

        {/* CANCELLED STATE */}
        {order && isCancelled && (
          <div className="ot-cancelled">
            <div className="ot-cancelled-icon"><LuX /></div>
            <h3>Order Cancelled</h3>
            <p>This order has been cancelled. If you believe this is a mistake, please contact our support team.</p>
            <Link to="/support" className="ot-support-link">Contact Support</Link>
          </div>
        )}

        {/* EMPTY SEARCH STATE */}
        {!searched && !order && (
          <div className="ot-empty">
            <div className="ot-empty-icon"><LuHouse /></div>
            <h3>Where's my order?</h3>
            <p>
              Your order ID was sent to you at checkout. It looks like{" "}
              <strong>ORD-ABC123</strong>. Enter it above to track your delivery.
            </p>
            <p className="ot-empty-sub">
              Having trouble?{" "}
              <Link to="/support" className="ot-link">Contact our support team</Link>
            </p>
          </div>
        )}

      </div>
    </section>
  );
}

export default OrderTracking;
