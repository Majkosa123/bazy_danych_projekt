import axios from "axios";

const BASE_URL = "http://localhost:3002/api/v1";

export const createOrder = async (userId = null) => {
  try {
    const response = await axios.post(`${BASE_URL}/orders`, { userId });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas tworzenia zamówienia:", error);
    throw error;
  }
};

export const addOrderItem = async (orderId, itemData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/orders/${orderId}/items`,
      itemData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Błąd podczas dodawania produktu do zamówienia ${orderId}:`,
      error
    );
    throw error;
  }
};

export const removeOrderItem = async (orderId, itemId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/orders/${orderId}/items/${itemId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Błąd podczas usuwania produktu z zamówienia:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(`${BASE_URL}/orders/${orderId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(`Błąd podczas aktualizacji statusu zamówienia:`, error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${BASE_URL}/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Błąd podczas pobierania zamówienia ${orderId}:`, error);
    throw error;
  }
};
