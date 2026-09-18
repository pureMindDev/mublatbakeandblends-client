import "./Checkout.css";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { MdOutlineVerifiedUser, MdAccountBalance } from "react-icons/md";
import { FiLock } from "react-icons/fi";
import { CartContext, getCachedImage } from "../../context/CartContext";
import { validateCheckout } from "../../utils/validators";
import { createOrder } from "../../services/orderService";
import { BANK_DETAILS } from "../../utils/bankDetails";
import { toastError } from "../../utils/swal";

// ─── Main Checkout page ───────────────────────────────────────────────────────
// Stripe/card payment has been temporarily removed from the active checkout
// (the business isn't registered yet, so Stripe Live can't be used). Bank
// Transfer is the only payment method for now. The Stripe integration files
// (paymentService.js, paymentController.js, paymentRoutes.js, config/stripe.js)
// are left in place untouched so this can be restored later.
function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [deliveryFee, setDeliveryFee] = useState(3.50);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    street: "", city: "", postcode: "",
  });
  const [errors, setErrors] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);

  const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: "" }));
  };

  // Bank transfer: create the order (backend generates the order number,
  // sets paymentStatus: "Pending", and sends the order-received + admin
  // emails), then send the customer to the success page showing the
  // transfer details. Payment itself is confirmed later by an admin.
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    if (placingOrder) return; // guard against double-clicks/duplicate submits

    const errs = validateCheckout({ ...form, method: deliveryMethod });
    if (errs) { setErrors(errs); return; }

    setPlacingOrder(true);

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
      });

      clearCart();
      navigate("/success", {
        state: {
          orderId: order._id,
          orderRef: order.orderId,
        },
      });
      // Do not redirect on failure, and do not send confirmation emails from
      // the client — both are handled server-side and only run on success.
    } catch (err) {
      toastError(err.response?.data?.message || "Could not place your order. Please try again.");
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
                  <p>Mublat Bake & Blends<br />12 Mayfair Square<br />London W1J 8AJ</p>
                </div>
              )}

              {/* PAYMENT METHOD — Bank Transfer only for now */}
              <div className="form-section">
                <h3>PAYMENT METHOD</h3>
                <div className="delivery-options">
                  <div className="delivery-card active">
                    <div><p><MdAccountBalance style={{ marginRight: 6 }} />Bank Transfer</p><span>Pay directly to our account</span></div>
                  </div>
                </div>
              </div>

              <p className="pay-hint">
                Fill in the details above, then confirm your bank transfer order in the order review panel →
              </p>

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

              {/* Bank transfer instructions */}
              {cartItems.length > 0 && (
                <div className="bank-transfer-box">
                  <h3 className="stripe-section-title">BANK TRANSFER DETAILS</h3>
                  <div className="bank-row"><span>Account Name</span><strong>{BANK_DETAILS.accountName}</strong></div>
                  <div className="bank-row"><span>Bank</span><strong>{BANK_DETAILS.bankName}</strong></div>
                  <div className="bank-row"><span>Sort Code</span><strong>{BANK_DETAILS.sortCode}</strong></div>
                  <div className="bank-row"><span>Account No.</span><strong>{BANK_DETAILS.accountNumber}</strong></div>
                  <p className="bank-note">
                    Use your order number as the payment reference once your order is placed. We'll confirm
                    your order by email once the transfer is received.
                  </p>
                  <button
                    className="pay-btn"
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    style={{ marginTop: 20 }}
                  >
                    <MdAccountBalance style={{ fontSize: 16 }} />
                    {placingOrder ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
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
