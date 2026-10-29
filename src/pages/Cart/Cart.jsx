import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

import { LuTruck } from "react-icons/lu";
import { AiOutlineShop } from "react-icons/ai";
import { TiArrowRight } from "react-icons/ti";

import { CartContext } from "../../context/CartContext";
import CartItem from "../../components/CartItem/CartItem";
import DeliveryPolicy from "../../components/DeliveryPolicy/DeliveryPolicy";
import useOrderQuote from "../../hooks/useOrderQuote";
import { tierLabel } from "../../utils/delivery";

function Cart() {

  const { cartItems } = useContext(CartContext);

  const [method, setMethod] = useState("Delivery");

  // Subtotal, delivery charge and total all come from one place: the shared
  // delivery rules, confirmed by the server (the same numbers the order saves).
  const {
    subtotal, deliveryFee, deliveryTier, totalAmount: total,
    pastryUnits, drinkUnits, error: quoteError,
  } = useOrderQuote(cartItems, method);

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
              {tierLabel(deliveryTier) && <span className="delivery-tag">{tierLabel(deliveryTier)}</span>}
            </span>
            <span>{deliveryFee === 0 ? "FREE" : `£${deliveryFee.toFixed(2)}`}</span>
          </div>

          {method === "Delivery" && cartItems.length > 0 && (
            <p className="delivery-basket-note">
              Your basket: {pastryUnits} pastry piece{pastryUnits === 1 ? "" : "s"} · {drinkUnits} drink bottle{drinkUnits === 1 ? "" : "s"}
              <br />Delivering to Newry? The £3.50 Newry fee is applied at checkout once you enter your address.
            </p>
          )}

          {quoteError && <p className="cart-quote-error" role="alert">{quoteError}</p>}

          <details className="delivery-policy-toggle">
            <summary>Delivery charges</summary>
            <DeliveryPolicy heading={false} />
          </details>

          <div className="summary-total">
            <span>Total</span>
            <div className="total-right">
              <span className="total-price">£{total.toFixed(2)}</span>
              <p className="vat-text">Including VAT</p>
            </div>
          </div>

          <Link to="/checkout" state={{ method }} className="checkout-btn">
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