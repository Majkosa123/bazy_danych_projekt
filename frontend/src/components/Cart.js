import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } =
    useContext(CartContext);
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Twój koszyk jest pusty</h2>
        <p>Dodaj produkty, aby złożyć zamówienie</p>
        <Link to="/" className="button">
          Wróć do menu
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Twój koszyk</h1>

      <div className="cart-items">
        {cart.map((item, index) => (
          <div key={index} className="cart-item">
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="item-price">{item.price.toFixed(2)} zł</p>

              {item.customizations.length > 0 && (
                <div className="item-customizations">
                  <p>Dodatki:</p>
                  <ul>
                    {item.customizations.map((customization, idx) => (
                      <li key={idx}>
                        {customization.name}
                        {customization.priceModifier > 0 && (
                          <span>
                            {" "}
                            +{customization.priceModifier.toFixed(2)} zł
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.specialInstructions && (
                <p className="special-instructions">
                  <strong>Dodatkowe instrukcje:</strong>{" "}
                  {item.specialInstructions}
                </p>
              )}
            </div>

            <div className="item-actions">
              <div className="quantity-controls">
                <button
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="item-total">{item.totalPrice.toFixed(2)} zł</div>

              <button
                onClick={() => removeFromCart(index)}
                className="remove-button"
              >
                Usuń
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <h2>Razem:</h2>
          <h2>{totalPrice.toFixed(2)} zł</h2>
        </div>

        <div className="cart-actions">
          <button onClick={() => clearCart()} className="clear-cart-button">
            Wyczyść koszyk
          </button>
          <Link to="/" className="continue-shopping-button">
            Kontynuuj zakupy
          </Link>
          <button
            onClick={() => navigate("/checkout")}
            className="checkout-button"
          >
            Przejdź do finalizacji
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
