const axios = require("axios");

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:3002/api/v1";

const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error(
      `Błąd podczas pobierania zamówienia ${orderId}:`,
      error.message
    );
    throw new Error(
      `Nie można pobrać informacji o zamówieniu: ${error.message}`
    );
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(
      `${ORDER_SERVICE_URL}/orders/${orderId}/status`,
      { status }
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `Błąd podczas aktualizacji statusu zamówienia ${orderId}:`,
      error.message
    );
    throw new Error(
      `Nie można zaktualizować statusu zamówienia: ${error.message}`
    );
  }
};

module.exports = {
  getOrderById,
  updateOrderStatus,
};
