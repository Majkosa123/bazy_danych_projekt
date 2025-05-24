import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { createOrder, addOrderItem } from "../api/orderApi";
import { fetchDeliveryOptions, createOrderDelivery } from "../api/deliveryApi";
import { fetchPaymentMethods, processPayment } from "../api/paymentApi";
import Spinner from "../components/common/Spinner";

function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [error, setError] = useState(null);

  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
      return;
    }

    const loadCheckoutData = async () => {
      try {
        setLoading(true);

        const [deliveryData, paymentData] = await Promise.all([
          fetchDeliveryOptions(),
          fetchPaymentMethods(),
        ]);

        setDeliveryOptions(deliveryData.data);
        setPaymentMethods(paymentData.data);

        if (deliveryData.data.length > 0) {
          setSelectedDeliveryOption(deliveryData.data[0].id);
        }

        if (paymentData.data.length > 0) {
          setSelectedPaymentMethod(paymentData.data[0].id);
        }
      } catch (err) {
        setError("Nie udało się załadować danych do finalizacji zamówienia.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [cart, navigate]);

  const handleSubmitOrder = async () => {
    if (!selectedDeliveryOption || !selectedPaymentMethod) {
      setError("Proszę wybrać opcję dostawy i metodę płatności.");
      return;
    }

    try {
      setProcessingOrder(true);

      const orderResponse = await createOrder();
      const orderId = orderResponse.data.id;

      await Promise.all(
        cart.map((item) =>
          addOrderItem(orderId, {
            productId: item.id,
            quantity: item.quantity,
            customizations: item.customizations,
            specialInstructions: item.specialInstructions,
          })
        )
      );

      await createOrderDelivery(orderId, {
        deliveryOptionId: selectedDeliveryOption,
        tableId: tableNumber || null,
        notes,
      });

      await processPayment(orderId, {
        paymentMethodId: selectedPaymentMethod,
      });

      clearCart();
      navigate("/thank-you", {
        state: {
          orderId,
          totalAmount: totalPrice,
        },
      });
    } catch (err) {
      setError(`Nie udało się złożyć zamówienia: ${err.message}`);
      console.error(err);
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="checkout-page">
      <h1>Finalizacja zamówienia</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-section">
        <h2>Twoje zamówienie</h2>
        <div className="order-summary">
          {cart.map((item, index) => (
            <div key={index} className="summary-item">
              <div className="summary-item-quantity">{item.quantity}x</div>
              <div className="summary-item-name">{item.name}</div>
              <div className="summary-item-price">
                {item.totalPrice.toFixed(2)} zł
              </div>
            </div>
          ))}

          <div className="summary-total">
            <div>Razem:</div>
            <div>{totalPrice.toFixed(2)} zł</div>
          </div>
        </div>
      </div>

      <div className="checkout-section">
        <h2>Wybierz opcję dostawy</h2>
        <div className="delivery-options">
          {deliveryOptions.map((option) => (
            <div key={option.id} className="delivery-option">
              <label>
                <input
                  type="radio"
                  name="deliveryOption"
                  value={option.id}
                  checked={selectedDeliveryOption === option.id}
                  onChange={(e) => setSelectedDeliveryOption(e.target.value)}
                />
                <div className="option-details">
                  <h3>{option.name}</h3>
                  <p>{option.description}</p>
                  <p>Szacowany czas: {option.estimatedTimeMinutes} min</p>
                </div>
              </label>
            </div>
          ))}
        </div>

        {selectedDeliveryOption &&
          deliveryOptions.find(
            (option) =>
              option.id === selectedDeliveryOption &&
              option.name === "Na miejscu"
          ) && (
            <div className="table-number-input">
              <label htmlFor="tableNumber">Numer stolika:</label>
              <input
                type="number"
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                min="1"
                required
              />
            </div>
          )}

        <div className="notes-input">
          <label htmlFor="notes">Dodatkowe uwagi:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dodatkowe instrukcje dotyczące dostawy..."
          />
        </div>
      </div>

      <div className="checkout-section">
        <h2>Wybierz metodę płatności</h2>
        <div className="payment-methods">
          {paymentMethods.map((method) => (
            <div key={method.id} className="payment-method">
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedPaymentMethod === method.id}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="method-details">
                  <h3>{method.name}</h3>
                  <p>{method.description}</p>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="checkout-actions">
        <button
          onClick={() => navigate("/cart")}
          className="back-to-cart-button"
        >
          Wróć do koszyka
        </button>

        <button
          onClick={handleSubmitOrder}
          disabled={processingOrder}
          className="place-order-button"
        >
          {processingOrder ? "Przetwarzanie..." : "Złóż zamówienie"}
        </button>
      </div>
    </div>
  );
}

export default CheckoutPage;
