import "./Checkout.css";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { MdOutlineVerifiedUser, MdAccountBalance } from "react-icons/md";
import { FiLock, FiCreditCard } from "react-icons/fi";
import { CartContext, getCachedImage } from "../../context/CartContext";
import { validateCheckout } from "../../utils/validators";
import { createPaymentIntent, confirmPayment } from "../../services/paymentService";
import { createOrder } from "../../services/orderService";

// Update these with your real bank details before going live
const BANK_DETAILS = {
  accountName: "Mublat Pastries & Drinks Ltd",
  sortCode: "12-34-56",
  accountNumber: "12345678",
  bankName: "Barclays Bank UK",
};

// Load Stripe once outside the component
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);

// Stripe appearance to match the dark Mublat theme
const STRIPE_APPEARANCE = {
  theme: "night",
  variables: {
    colorPrimary: "#d4af37",
    colorBackground: "#111111",
    colorText: "#e4e2dd",
    colorDanger: "#ff6b6b",
    fontFamily: "Lato, sans-serif",
    borderRadius: "10px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #2a2a2a",
      backgroundColor: "#0d0d0d",
      color: "#e4e2dd",
    },
    ".Input:focus": {
      border: "1px solid #d4af37",
      boxShadow: "none",
    },
    ".Label": {
      color: "#888",
      fontSize: "12px",
      letterSpacing: "1px",
      textTransform: "uppercase",
    },
    ".Tab": {
      border: "1px solid #2a2a2a",
      backgroundColor: "#111",
    },
    ".Tab--selected": {
      border: "1px solid #d4af37",
      backgroundColor: "#1c1810",
    },
  },
};

// ─── Inner payment form (must be inside <Elements>) ───────────────────────────
function PaymentForm({ orderId, total, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setPaying(true);
    onError("");

    // 1. Confirm card payment on the client — no redirect
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",   // stay on the page
    });

    if (error) {
      onError(error.message || "Payment failed. Please check your card details.");
      setPaying(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      try {
        // 2. Tell our backend to mark the order paid and send emails
        const result = await confirmPayment({
          paymentIntentId: paymentIntent.id,
          orderId,
        });
        onSuccess(result);
      } catch (err) {
        onError(err.response?.data?.message || "Payment succeeded but order confirmation failed. Please contact support.");
        setPaying(false);
      }
    } else {
      onError(`Unexpected payment status: ${paymentIntent.status}`);
      setPaying(false);
    }
  };

  return (
    <div className="stripe-form-wrapper">
      <h3 className="stripe-section-title">CARD DETAILS</h3>
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: { billingDetails: { address: { country: "GB" } } },
        }}
      />
      <button
        className="pay-btn"
        onClick={handlePay}
        disabled={!stripe || paying}
        style={{ marginTop: 20 }}
      >
        <FiCreditCard style={{ fontSize: 16 }} />
        {paying ? "Processing…" : "Pay Now with Stripe"}
      </button>
    </div>
  );
}

// ─── Main Checkout page ───────────────────────────────────────────────────────
function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [deliveryFee, setDeliveryFee] = useState(3.50);
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "bank"
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    street: "", city: "", postcode: "",
  });
  const [errors, setErrors] = useState({});
  const [payError, setPayError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: "" }));
    setPayError("");
  };

  // Auto-create the PaymentIntent in the background, debounced, as soon as
  // the required fields are valid — no separate "continue" step/page.
  // The card fields simply appear in the order summary once it's ready.
  // Only runs for the "card" payment method.
  const debounceRef = useRef(null);
  useEffect(() => {
    if (paymentMethod !== "card") return;
    if (cartItems.length === 0) return;
    if (clientSecret) return; // only create once per visit to this page

    const errs = validateCheckout({ ...form, method: deliveryMethod });
    if (errs) return; // wait until the form is actually valid, silently

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPreparing(true);
      setPayError("");
      try {
        const res = await createPaymentIntent({
          items: cartItems.map(i => ({
            name: i.name,
            optionName: i.optionName,
            price: i.price,
            quantity: i.quantity,
          })),
          customerName: form.fullName,
          email: form.email,
          phone: form.phone,
          address:
            deliveryMethod === "delivery"
              ? `${form.street}, ${form.city}, ${form.postcode}`
              : "",
          method: deliveryMethod === "delivery" ? "Delivery" : "Pickup",
          deliveryFee,
        });
        setClientSecret(res.clientSecret);
        setOrderId(res.orderId);
      } catch (err) {
        setPayError(err.response?.data?.message || "Could not initialise payment. Please try again.");
      } finally {
        setPreparing(false);
      }
    }, 700);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, deliveryMethod, deliveryFee, cartItems, clientSecret, paymentMethod]);

  const handleSuccess = (result) => {
    clearCart();
    navigate("/success", {
      state: {
        orderId: result.orderId,
        orderRef: result.orderRef,
        deliveryMethod,
        deliveryFee,
        subtotal,
        total,
        customerName: form.fullName,
        email: form.email,
      },
    });
  };

  // Bank transfer: place the order directly (no Stripe), mark unpaid,
  // and send the customer to a success page showing the transfer details.
  const handleBankOrder = async () => {
    if (cartItems.length === 0) return;

    const errs = validateCheckout({ ...form, method: deliveryMethod });
    if (errs) { setErrors(errs); return; }

    setPlacingOrder(true);
    setPayError("");

    try {
      const order = await createOrder({
        customerName: form.fullName,
        email: form.email,
        phone: form.phone,
        address:
          deliveryMethod === "delivery"
            ? `${form.street}, ${form.city}, ${form.postcode}`
            : "",
        method: deliveryMethod === "delivery" ? "Delivery" : "Pickup",
        paymentMethod: "Bank Transfer",
        deliveryFee,
        items: cartItems.map(i => ({
          name: i.name,
          optionName: i.optionName,
          price: i.price,
          quantity: i.quantity,
        })),
        totalAmount: total,
        isPaid: false,
      });

      clearCart();
      navigate("/success", {
        state: {
          orderId: order._id,
          orderRef: order.orderId,
          deliveryMethod,
          deliveryFee,
          subtotal,
          total,
          customerName: form.fullName,
          email: form.email,
          paymentMethod: "Bank Transfer",
          bankDetails: BANK_DETAILS,
        },
      });
    } catch (err) {
      setPayError(err.response?.data?.message || "Could not place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <section className="checkout-page">
      <div className="container">

        <div className="checkout-header">
          <Link to="/cart" className="back-link">← Return to Cart</Link>
          <h1>Checkout</h1>
          <p>Complete your order details below to indulge in luxury.</p>
        </div>

        <div className="checkout-grid">

          {/* ── LEFT ── */}
          <div>
            <div className="checkout-form">

              {/* CONTACT */}
              <div className="form-section">
                <h3>CONTACT DETAILS</h3>
                <div className="form-row">
                  <div>
                    <label>FULL NAME</label>
                    <input
                      name="fullName"
                      placeholder="Alexander Mublat"
                      value={form.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <small className="field-error">{errors.fullName}</small>}
                  </div>
                  <div>
                    <label>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <small className="field-error">{errors.email}</small>}
                    <small className="text">Your receipt and order updates will be sent here.</small>
                  </div>
                  <div>
                    <label>PHONE NUMBER</label>
                    <input
                      name="phone"
                      placeholder="+44 7700 900000"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <small className="field-error">{errors.phone}</small>}
                    <small className="text">We'll text you when your order is ready.</small>
                  </div>
                </div>
              </div>

              {/* DELIVERY METHOD */}
              <div className="form-section">
                <h3>DELIVERY METHOD</h3>
                <div className="delivery-options">
                  <div
                    className={deliveryMethod === "delivery" ? "delivery-card active" : "delivery-card"}
                    onClick={() => { setDeliveryMethod("delivery"); setDeliveryFee(3.50); }}
                  >
                    <div><p>Premium Delivery</p><span>Doorstep in 30–45 mins</span></div>
                    <strong>£3.50</strong>
                  </div>
                  <div
                    className={deliveryMethod === "pickup" ? "delivery-card active" : "delivery-card"}
                    onClick={() => { setDeliveryMethod("pickup"); setDeliveryFee(0); }}
                  >
                    <div><p>Boutique Pickup</p><span>Ready in 15 mins</span></div>
                    <strong>FREE</strong>
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              {deliveryMethod === "delivery" && (
                <div className="form-section">
                  <h3>SHIPPING ADDRESS</h3>
                  <label>HOUSE NUMBER & STREET</label>
                  <input
                    name="street"
                    placeholder="12–14 Mayfair Square"
                    value={form.street}
                    onChange={handleChange}
                  />
                  {errors.street && <small className="field-error">{errors.street}</small>}
                  <div className="form-row">
                    <div>
                      <label>CITY</label>
                      <input name="city" placeholder="London" value={form.city} onChange={handleChange} />
                      {errors.city && <small className="field-error">{errors.city}</small>}
                    </div>
                    <div>
                      <label>POSTCODE</label>
                      <input name="postcode" placeholder="W1J 8AJ" value={form.postcode} onChange={handleChange} />
                      {errors.postcode && <small className="field-error">{errors.postcode}</small>}
                    </div>
                  </div>
                </div>
              )}

              {deliveryMethod === "pickup" && (
                <div className="pickup-info">
                  <h4>Pickup Location</h4>
                  <p>Mublat Pastries & Drinks<br />12 Mayfair Square<br />London W1J 8AJ</p>
                </div>
              )}

              {/* PAYMENT METHOD */}
              <div className="form-section">
                <h3>PAYMENT METHOD</h3>
                <div className="delivery-options">
                  <div
                    className={paymentMethod === "card" ? "delivery-card active" : "delivery-card"}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div><p><FiCreditCard style={{ marginRight: 6 }} />Card</p><span>Pay securely with Stripe</span></div>
                  </div>
                  <div
                    className={paymentMethod === "bank" ? "delivery-card active" : "delivery-card"}
                    onClick={() => setPaymentMethod("bank")}
                  >
                    <div><p><MdAccountBalance style={{ marginRight: 6 }} />Bank Transfer</p><span>Pay directly to our account</span></div>
                  </div>
                </div>
              </div>

              {payError && <p className="field-error" style={{ marginBottom: 12 }}>{payError}</p>}

              {paymentMethod === "card" ? (
                <p className="pay-hint">
                  {preparing
                    ? "Preparing secure payment…"
                    : clientSecret
                      ? "✓ All set — enter your card details in the order review panel to complete payment →"
                      : "Fill in the details above — the payment form will appear in the order review panel automatically."}
                </p>
              ) : (
                <p className="pay-hint">
                  Fill in the details above, then confirm your bank transfer order in the order review panel →
                </p>
              )}

            </div>
          </div>

          {/* ── RIGHT — ORDER SUMMARY ── */}
          <div>
            <div className="checkout-summary">
              <h3><FiLock /> Final Order Review</h3>

              {cartItems.length === 0 ? (
                <p className="empty-notice">Your cart is empty. <Link to="/menu">Browse the menu</Link></p>
              ) : (
                cartItems.map(item => (
                  <div key={item.id + (item.optionName || "")} className="summary-item">
                    {(() => {
                      const src = item.image || getCachedImage(item.id, item.optionName);
                      return src
                        ? <img src={src} alt={item.name} />
                        : <div className="summary-item-fallback">{item.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}</div>;
                    })()}
                    <div>
                      <p>{item.name}</p>
                      <span>{item.quantity} × £{item.price.toFixed(2)}</span>
                    </div>
                    <strong>£{(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                ))
              )}

              <div className="summary-breakdown">
                <div><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
                <div><span>Delivery</span><span>{deliveryFee === 0 ? "FREE" : `£${deliveryFee.toFixed(2)}`}</span></div>
              </div>

              <div className="total">
                <span>Total Amount</span>
                <span>£{total.toFixed(2)}</span>
              </div>
              <p className="vat-note">Inclusive of VAT (20%)</p>

              {/* Payment area — card fields or bank transfer instructions */}
              {paymentMethod === "card" ? (
                clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
                  >
                    <PaymentForm
                      orderId={orderId}
                      total={total}
                      onSuccess={handleSuccess}
                      onError={setPayError}
                    />
                  </Elements>
                ) : (
                  cartItems.length > 0 && (
                    <p className="pay-hint" style={{ marginTop: 16 }}>
                      {preparing ? "Preparing secure payment…" : "Complete the details on the left to unlock payment."}
                    </p>
                  )
                )
              ) : (
                cartItems.length > 0 && (
                  <div className="bank-transfer-box">
                    <h3 className="stripe-section-title">BANK TRANSFER DETAILS</h3>
                    <div className="bank-row"><span>Account Name</span><strong>{BANK_DETAILS.accountName}</strong></div>
                    <div className="bank-row"><span>Bank</span><strong>{BANK_DETAILS.bankName}</strong></div>
                    <div className="bank-row"><span>Sort Code</span><strong>{BANK_DETAILS.sortCode}</strong></div>
                    <div className="bank-row"><span>Account No.</span><strong>{BANK_DETAILS.accountNumber}</strong></div>
                    <p className="bank-note">
                      Use your name as the payment reference. We'll confirm your order once the transfer is received.
                    </p>
                    <button
                      className="pay-btn"
                      onClick={handleBankOrder}
                      disabled={placingOrder}
                      style={{ marginTop: 20 }}
                    >
                      <MdAccountBalance style={{ fontSize: 16 }} />
                      {placingOrder ? "Placing Order…" : "Place Order — Pay by Bank Transfer"}
                    </button>
                  </div>
                )
              )}

              <p className="secure"><MdOutlineVerifiedUser /> ENCRYPTED PAYMENT PROCESSING</p>
            </div>

            <div className="concierge-box">
              <p>"Need assistance with your luxury order? Our concierge is available 24/7."</p>
              <button onClick={() => navigate("/support")}>Contact Concierge</button>
            </div>
          </div>

        </div>

        <div className="checkout-footer">
          <span className="secure-left"><MdOutlineVerifiedUser /> 256-bit SSL Secure Checkout</span>
          <div className="payment-icons">
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>AMEX</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;