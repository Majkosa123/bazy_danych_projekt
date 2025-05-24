import axios from "axios";

const BASE_URL = "http://localhost:3001/api/v1";

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    return response.data.data;
  } catch (error) {
    console.error("Błąd podczas pobierania kategorii:", error);
    throw error;
  }
};

export const fetchProductsByCategory = async (categoryId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/products/category/${categoryId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Błąd podczas pobierania produktów dla kategorii ${categoryId}:`,
      error
    );
    throw error;
  }
};

export const fetchProductDetails = async (productId) => {
  try {
    const response = await axios.get(`${BASE_URL}/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Błąd podczas pobierania szczegółów produktu ${productId}:`,
      error
    );
    throw error;
  }
};
