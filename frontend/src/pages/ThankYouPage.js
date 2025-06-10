import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getOrderById } from "../api/orderApi";
import Spinner from "../components/common/Spinner";

function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();

  console.log("🎯 ThankYouPage loaded");
  console.log("📊 Location:", location);
  console.log("📊 Location state:", location.state);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // Pobierz orderId ze stanu przekazanego przez nawigację
  const { orderId, totalAmount } = location.state || {};

  console.log("📊 Extracted orderId:", orderId);
  console.log("📊 Extracted totalAmount:", totalAmount);

  useEffect(() => {
    console.log("🔍 UseEffect - checking orderId:", orderId);

    if (!orderId) {
      console.log("❌ No orderId, redirecting to home");
      navigate("/");
      return;
    }

    console.log("✅ OrderId found, fetching order details");

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(orderId);
        setOrder(response.data);
      } catch (err) {
        setError("Nie udało się załadować szczegółów zamówienia.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  // Wyciągnięty drugi useEffect poza warunek, aby zachować regułę hooks
  useEffect(() => {
    // Automatyczne przekierowanie po 10 sekundach, tylko jeśli mamy orderId
    if (orderId) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 10000); // 10 sekund

      return () => clearTimeout(timer);
    }
  }, [navigate, orderId]); // Dodany orderId jako zależność

  if (loading) return <Spinner />;
  if (error) return <div className="error-message">{error}</div>;
  // Dodany warunek, aby upewnić się, że komponent nie renderuje się bez orderId
  if (!orderId) return null;

  return (
    <div className="thank-you-page">
      <div className="thank-you-content">
        <h1>Dziękujemy za zamówienie!</h1>

        <div className="order-success">
          <div className="success-icon">✓</div>
          <p className="success-message">Twoje zamówienie zostało przyjęte.</p>
        </div>

        <div className="order-info">
          <p>
            Numer zamówienia: <strong>{orderId}</strong>
          </p>
          <p>
            Status: <strong>{order?.status || "W przygotowaniu"}</strong>
          </p>
          <p>
            Całkowita kwota:{" "}
            <strong>
              {totalAmount ? `${totalAmount.toFixed(2)} zł` : "Nie określono"}
            </strong>
          </p>
        </div>

        <div className="order-instructions">
          <h2>Co dalej?</h2>
          <p>
            Twoje zamówienie jest teraz przygotowywane. Informacje o statusie
            zamówienia będą wyświetlane na ekranie w restauracji.
          </p>
          <p>Numer zamówienia będzie potrzebny do odbioru posiłku.</p>
        </div>

        <div className="countdown">
          <p>Ta strona zostanie automatycznie zamknięta za kilka sekund.</p>
        </div>

        <Link to="/" className="new-order-button">
          Złóż nowe zamówienie
        </Link>
      </div>
    </div>
  );
}

export default ThankYouPage;
