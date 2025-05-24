import axios from "axios";

const BASE_URL = "http://localhost:3003/api/v1";

export const fetchDeliveryOptions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/delivery-options`);
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania opcji dostawy:", error);
    throw error;
  }
};

export const createOrderDelivery = async (orderId, deliveryData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/order-deliveries/${orderId}`,
      deliveryData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Błąd podczas tworzenia dostawy dla zamówienia ${orderId}:`,
      error
    );
    throw error;
  }
};

export const getAvailableTables = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/tables/available`);
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania dostępnych stolików:", error);
    throw error;
  }
};
