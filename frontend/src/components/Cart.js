import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { validatePromoCode } from "../api/paymentApi";

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } =
    useContext(CartContext);
  const navigate = useNavigate();

  // Stany dla kodu rabatowego
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 0 : numPrice;
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Wprowadź kod rabatowy");
      return;
    }

    if (cart.length === 0) {
      setPromoError("Koszyk jest pusty");
      return;
    }

    setPromoLoading(true);
    setPromoError("");

    try {
      const tempOrderData = {
        totalAmount: totalPrice,
        currency: "PLN",
      };

      const response = await validatePromoCode(promoCode, tempOrderData);

      setPromoDiscount(response.data);
      setAppliedPromoCode(promoCode);
      setPromoCode("");
      console.log("Kod rabatowy zastosowany:", response.data);
    } catch (error) {
      console.error("Błąd kodu rabatowego:", error);
      setPromoError(
        error.response?.data?.message ||
          "Nieprawidłowy kod rabatowy lub kod wygasł"
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoDiscount(null);
    setAppliedPromoCode(null);
    setPromoError("");
  };

  const calculateFinalPrice = () => {
    const basePrice = formatPrice(totalPrice);
    if (!promoDiscount) return basePrice;

    const discount = formatPrice(promoDiscount.discountAmount || 0);
    return Math.max(0, basePrice - discount);
  };

  const finalPrice = calculateFinalPrice();
  const savings = promoDiscount
    ? formatPrice(promoDiscount.discountAmount || 0)
    : 0;

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
              <p className="item-price">
                {formatPrice(item.price).toFixed(2)} zł
              </p>

              {item.customizations && item.customizations.length > 0 && (
                <div className="item-customizations">
                  <p>Dodatki:</p>
                  <ul>
                    {item.customizations.map((customization, idx) => (
                      <li key={idx}>
                        {customization.name}
                        {customization.priceModifier > 0 && (
                          <span>
                            {" "}
                            +
                            {formatPrice(customization.priceModifier).toFixed(
                              2
                            )}{" "}
                            zł
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

              <div className="item-total">
                {formatPrice(item.totalPrice).toFixed(2)} zł
              </div>

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

      {/* SEKCJA KODU RABATOWEGO */}
      <div className="promo-code-section">
        <h3>Kod rabatowy</h3>

        {!appliedPromoCode ? (
          <div className="promo-code-input">
            <div className="input-group">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Wprowadź kod rabatowy"
                maxLength={20}
                disabled={promoLoading}
              />
              <button
                onClick={handleApplyPromoCode}
                disabled={promoLoading || !promoCode.trim()}
                className="apply-promo-button"
              >
                {promoLoading ? "Sprawdzam..." : "Zastosuj"}
              </button>
            </div>

            {promoError && <div className="promo-error">{promoError}</div>}

            <div className="available-codes">
              <p>
                <small>
                  💡 Dostępne kody: <strong>WELCOME10</strong>,{" "}
                  <strong>FIXED20</strong>, <strong>SUMMER25</strong>
                </small>
              </p>
            </div>
          </div>
        ) : (
          <div className="applied-promo">
            <div className="promo-success">
              Kod <strong>{appliedPromoCode}</strong> został zastosowany!
              <button
                onClick={handleRemovePromoCode}
                className="remove-promo-button"
              >
                Usuń
              </button>
            </div>
            <div className="promo-details">
              <p>
                Oszczędzasz:{" "}
                <strong style={{ color: "#28a745" }}>
                  {savings.toFixed(2)} zł
                </strong>
              </p>
              {promoDiscount.promoCode && (
                <p>
                  <small>
                    {" "}
                    {promoDiscount.promoCode.description ||
                      "Rabat został naliczony"}
                  </small>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="cart-summary">
        <div className="price-breakdown">
          <div className="price-row">
            <span>Suma produktów:</span>
            <span>{formatPrice(totalPrice).toFixed(2)} zł</span>
          </div>

          {promoDiscount && (
            <div className="price-row discount">
              <span>Rabat ({appliedPromoCode}):</span>
              <span style={{ color: "#28a745" }}>-{savings.toFixed(2)} zł</span>
            </div>
          )}

          <div className="cart-total">
            <h2>Do zapłaty:</h2>
            <h2 style={{ color: promoDiscount ? "#28a745" : "inherit" }}>
              {finalPrice.toFixed(2)} zł
              {promoDiscount && (
                <small
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "normal",
                    color: "#666",
                  }}
                >
                  (zamiast {formatPrice(totalPrice).toFixed(2)} zł)
                </small>
              )}
            </h2>
          </div>
        </div>

        <div className="cart-actions">
          <button onClick={() => clearCart()} className="clear-cart-button">
            Wyczyść koszyk
          </button>
          <Link to="/" className="continue-shopping-button">
            Kontynuuj zakupy
          </Link>
          <button
            onClick={() =>
              navigate("/checkout", {
                state: { appliedPromoCode: promoDiscount },
              })
            }
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
