import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

import { LuTruck } from "react-icons/lu";
import { AiOutlineShop } from "react-icons/ai";
import { TiArrowRight } from "react-icons/ti";

import { CartContext } from "../../context/CartContext";
import CartItem from "../../components/CartItem/CartItem";

function Cart() {

  const { cartItems } = useContext(CartContext);

  const [method, setMethod] = useState("Delivery");

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 0
  );
  const deliveryFee = method === "Delivery" ? 3.50 : 0;
  const total = subtotal + deliveryFee;

  return (
    <section className="cart-page">
      <div className="container cart-grid">

        {/* LEFT SIDE */}
        <div className="cart-items">

          <div className="cart-header">
            <div>
              <h2>Your <span>Selection</span></h2>
              <p>Review your curated items for checkout.</p>
            </div>
            <span className="badge">{cartItems.length} Items</span>
          </div>

          <div className="cart-Details">
            {cartItems.length === 0 ? (
              <div className="empty-cart-state">
                <p>Your cart is empty.</p>
                <Link to="/menu" className="checkout-btn">
                  Browse Menu <TiArrowRight className="arrow" />
                </Link>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <React.Fragment key={item.id + item.optionName}>
                  <CartItem item={item} />
                  {index !== cartItems.length - 1 && <hr className="line" />}
                </React.Fragment>
              ))
            )}
          </div>

          {/* MEMBERSHIP */}
          <div className="membership-card">
            <p><strong>Mublat Premium Members</strong></p>
            <span>Sign in to earn {Math.floor(subtotal * 10)} reward points on this purchase.</span>
          </div>

        </div>

        {/* RIGHT SIDE — SUMMARY */}
        <div className="cart-summary">

          <nav className="cart-summaryHeader">
            <h3>Order <span>Summary</span></h3>
          </nav>

          {/* Fulfillment */}
          <div className="fulfillment">
            <h4>FULFILLMENT METHOD</h4>
            <div className="fulfillment-buttons">
              <button
                className={method === "Delivery" ? "active" : ""}
                onClick={() => setMethod("Delivery")}
              >
                <LuTruck className="icons" /> Delivery
              </button>
              <button
                className={method === "Pickup" ? "active" : ""}
                onClick={() => setMethod("Pickup")}
              >
                <AiOutlineShop className="icons" /> Pickup
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row delivery-row">
            <span>
              Delivery Fee
              <span className="delivery-tag">Standard</span>
            </span>
            <span>{deliveryFee === 0 ? "FREE" : `£${deliveryFee.toFixed(2)}`}</span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <div className="total-right">
              <span className="total-price">£{total.toFixed(2)}</span>
              <p className="vat-text">Including VAT</p>
            </div>
          </div>

          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout <span>→</span>
          </Link>

          <p className="agreement">
            By proceeding, you agree to Mublat's luxury standards and service agreement.
          </p>

        </div>

      </div>
    </section>
  );
}

export default Cart;