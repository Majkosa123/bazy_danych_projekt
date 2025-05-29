import axios from "axios";

const BASE_URL = "http://localhost:3004/api/v1";

export const fetchPaymentMethods = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/payment-methods`);
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania metod płatności:", error);
    throw error;
  }
};

export const processPayment = async (orderId, paymentData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/payments/order/${orderId}`,
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Błąd podczas przetwarzania płatności dla zamówienia ${orderId}:`,
      error
    );
    throw error;
  }
};

export const validatePromoCode = async (code, orderData) => {
  try {
    const requestData = {
      code,
      orderId: "temp-validation",
      totalAmount: orderData.totalAmount || 0,
    };

    console.log("🎟️ Sending promo code request:", requestData);

    const response = await axios.post(
      `${BASE_URL}/promo-codes/validate`,
      requestData
    );

    console.log("✅ Promo code response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Promo code error:", error.response?.data);
    console.error("Full error:", error);
    throw error;
  }
};

export const getPaymentReceipt = async (paymentId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/payments/${paymentId}/receipt`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Błąd podczas pobierania paragonu dla płatności ${paymentId}:`,
      error
    );
    throw error;
  }
};
