const axios = require("axios");

const MENU_SERVICE_URL =
  process.env.MENU_SERVICE_URL || "http://localhost:3001/api/v1";

const getProductById = async (productId) => {
  try {
    const response = await axios.get(
      `${MENU_SERVICE_URL}/products/${productId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `Błąd podczas pobierania produktu ${productId}:`,
      error.message
    );
    throw new Error(
      `Nie można pobrać informacji o produkcie: ${error.message}`
    );
  }
};

const checkProductAvailability = async (productId) => {
  try {
    const product = await getProductById(productId);
    return product.isAvailable === true;
  } catch (error) {
    console.error(
      `Błąd podczas sprawdzania dostępności produktu ${productId}:`,
      error.message
    );
    return false;
  }
};

module.exports = {
  getProductById,
  checkProductAvailability,
};
