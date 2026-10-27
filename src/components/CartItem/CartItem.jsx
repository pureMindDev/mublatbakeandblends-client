import React, { useContext } from "react";
import { CartContext, getCachedImage } from "../../context/CartContext";
import { LuPlus, LuMinus, LuTrash } from "react-icons/lu";
import { toastError } from "../../utils/swal";
import "./CartItem.css";
import SafeImage from "../SafeImage/SafeImage";

function CartItem({ item }) {
  const { increaseQty, decreaseQty, removeFromCart } = useContext(CartContext);

  const handleRemove = () => {
    removeFromCart(item.id, item.optionName);
    toastError(`${item.name} removed from cart.`);
  };

  return (
    <div className="cart-card">

      <SafeImage src={item.image || getCachedImage(item.id, item.optionName)} alt={item.name} className="cart-img" />

      <div className="cart-info">
        <h4>{item.name}</h4>
        <span className="tag">{item.optionName}</span>

        <div className="cart-qty">
          <button onClick={() => decreaseQty(item.id, item.optionName)}>
            <LuMinus />
          </button>
          <span>{item.quantity}</span>
          <button onClick={() => increaseQty(item.id, item.optionName)}>
            <LuPlus />
          </button>
        </div>
      </div>

      <div className="cart-right">
        <span className="price">
          £{(item.price * item.quantity).toFixed(2)}
        </span>
        <button
          className="remove-btn"
          onClick={handleRemove}
        >
          <LuTrash /> Remove
        </button>
      </div>

    </div>
  );
}

export default CartItem;