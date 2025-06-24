const axios = require("axios");

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:3002";

const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(
      `${ORDER_SERVICE_URL}/api/orders/${orderId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Błąd podczas pobierania zamówienia:", error.message);
    throw new Error("Nie można pobrać szczegółów zamówienia");
  }
};

const calculateLoyaltyPoints = (orderAmount) => {
  // 1 punkt za każde 10 PLN wydanych
  return Math.floor(orderAmount / 10);
};

module.exports = {
  getOrderById,
  calculateLoyaltyPoints,
};
