import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { createOrder, addOrderItem } from "../api/orderApi";
import { fetchDeliveryOptions, createOrderDelivery } from "../api/deliveryApi";
import { fetchPaymentMethods, processPayment } from "../api/paymentApi";
import TableSelection from "../components/TableSelection";
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
  const [selectedTable, setSelectedTable] = useState("");
  const [notes, setNotes] = useState("");

  // stany dla adresu dostawy
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    houseNumber: "",
    apartmentNumber: "",
    city: "",
    postalCode: "",
    phone: "",
    additionalInfo: "",
  });

  const isTableRequired = deliveryOptions.find(
    (option) =>
      option.id === selectedDeliveryOption && option.name === "Na miejscu"
  );

  const isDeliveryRequired = deliveryOptions.find(
    (option) =>
      option.id === selectedDeliveryOption && option.name === "Dostawa"
  );

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

  const handleDeliveryAddressChange = (field, value) => {
    setDeliveryAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateDeliveryAddress = () => {
    if (!isDeliveryRequired) return true;

    const required = ["street", "houseNumber", "city", "postalCode", "phone"];
    for (let field of required) {
      if (!deliveryAddress[field].trim()) {
        return false;
      }
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!selectedDeliveryOption || !selectedPaymentMethod) {
      setError("Proszę wybrać opcję dostawy i metodę płatności.");
      return;
    }

    // Sprawdź czy dla opcji "Na miejscu" wybrano stolik
    if (isTableRequired && !selectedTable) {
      setError("Proszę wybrać stolik dla opcji 'Na miejscu'.");
      return;
    }

    // Sprawdź czy dla opcji "Dostawa" wypełniono adres
    if (isDeliveryRequired && !validateDeliveryAddress()) {
      setError("Proszę wypełnić wszystkie wymagane pola adresu dostawy.");
      return;
    }

    try {
      setProcessingOrder(true);

      const orderResponse = await createOrder();
      const orderId = orderResponse.data.id;
      console.log("1. Order created:", orderId);

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
      console.log("2. All items added to order");

      // Przygotuj notatki z adresem dostawy
      let finalNotes = notes;
      if (isDeliveryRequired) {
        const addressText = `ADRES DOSTAWY:
Ulica: ${deliveryAddress.street} ${deliveryAddress.houseNumber}${
          deliveryAddress.apartmentNumber
            ? "/" + deliveryAddress.apartmentNumber
            : ""
        }
Miasto: ${deliveryAddress.city}
Kod pocztowy: ${deliveryAddress.postalCode}
Telefon: ${deliveryAddress.phone}
${
  deliveryAddress.additionalInfo
    ? "Dodatkowe info: " + deliveryAddress.additionalInfo
    : ""
}`;

        finalNotes = finalNotes
          ? `${addressText}\n\nUwagi: ${finalNotes}`
          : addressText;
      }

      console.log("3. Creating delivery...", {
        deliveryOptionId: selectedDeliveryOption,
        tableId: isTableRequired ? selectedTable : null,
        notes: finalNotes,
      });

      await createOrderDelivery(orderId, {
        deliveryOptionId: selectedDeliveryOption,
        tableId: isTableRequired ? selectedTable : null,
        notes: finalNotes,
      });
      console.log("3. Delivery created");

      console.log("4. Processing payment...", {
        paymentMethodId: selectedPaymentMethod,
      });

      await processPayment(orderId, {
        paymentMethodId: selectedPaymentMethod,
      });
      console.log("4. Payment processed");

      clearCart();
      console.log("5. Cart cleared, navigating...");

      console.log("5. About to navigate to thank-you");
      console.log("Data being sent:", {
        orderId,
        totalAmount: totalPrice,
      });
      setTimeout(() => {
        navigate("/thank-you", {
          state: {
            orderId,
            totalAmount: totalPrice,
          },
        });

        console.log("Navigate called to /thank-you");
      }, 100);
    } catch (err) {
      console.error("Error at step:", err);
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

      {/* Podsumowanie zamówienia */}
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

      {/* Opcje dostawy */}
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
                  onChange={(e) => {
                    setSelectedDeliveryOption(e.target.value);
                    // Reset wyboru stolika i adresu gdy zmienia się opcja dostawy
                    setSelectedTable("");
                    setDeliveryAddress({
                      street: "",
                      houseNumber: "",
                      apartmentNumber: "",
                      city: "",
                      postalCode: "",
                      phone: "",
                      additionalInfo: "",
                    });
                  }}
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

        {/* Wybór stolika - tylko dla opcji "Na miejscu" */}
        {isTableRequired && (
          <div className="table-selection-section">
            <TableSelection
              selectedTable={selectedTable}
              onTableSelect={setSelectedTable}
            />
          </div>
        )}

        {/* Formularz adresu - tylko dla opcji "Dostawa" */}
        {isDeliveryRequired && (
          <div className="delivery-address-section">
            <h3>Adres dostawy</h3>
            <div className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="street">Ulica *</label>
                  <input
                    type="text"
                    id="street"
                    value={deliveryAddress.street}
                    onChange={(e) =>
                      handleDeliveryAddressChange("street", e.target.value)
                    }
                    placeholder="np. Marszałkowska"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="houseNumber">Numer domu *</label>
                  <input
                    type="text"
                    id="houseNumber"
                    value={deliveryAddress.houseNumber}
                    onChange={(e) =>
                      handleDeliveryAddressChange("houseNumber", e.target.value)
                    }
                    placeholder="np. 15"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="apartmentNumber">Numer mieszkania</label>
                  <input
                    type="text"
                    id="apartmentNumber"
                    value={deliveryAddress.apartmentNumber}
                    onChange={(e) =>
                      handleDeliveryAddressChange(
                        "apartmentNumber",
                        e.target.value
                      )
                    }
                    placeholder="np. 23"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">Miasto *</label>
                  <input
                    type="text"
                    id="city"
                    value={deliveryAddress.city}
                    onChange={(e) =>
                      handleDeliveryAddressChange("city", e.target.value)
                    }
                    placeholder="np. Warszawa"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Kod pocztowy *</label>
                  <input
                    type="text"
                    id="postalCode"
                    value={deliveryAddress.postalCode}
                    onChange={(e) =>
                      handleDeliveryAddressChange("postalCode", e.target.value)
                    }
                    placeholder="np. 00-001"
                    pattern="[0-9]{2}-[0-9]{3}"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Telefon *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={deliveryAddress.phone}
                    onChange={(e) =>
                      handleDeliveryAddressChange("phone", e.target.value)
                    }
                    placeholder="np. 123-456-789"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="additionalInfo">Dodatkowe informacje</label>
                <textarea
                  id="additionalInfo"
                  value={deliveryAddress.additionalInfo}
                  onChange={(e) =>
                    handleDeliveryAddressChange(
                      "additionalInfo",
                      e.target.value
                    )
                  }
                  placeholder="np. kod do bramy, piętro, dodatkowe wskazówki..."
                  rows="3"
                />
              </div>

              <p className="required-note">* - pola wymagane</p>
            </div>
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

      {/* Metody płatności */}
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
