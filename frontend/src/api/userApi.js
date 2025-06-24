import axios from "axios";

const BASE_URL = "http://localhost:3005/api/v1";

// Pomocnicza funkcja do pobierania tokena z localStorage
const getToken = () => {
  return localStorage.getItem("userToken");
};

// Pomocnicza funkcja do nagłówków z tokenem
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

//rejstracja i logowanie

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/register`, userData);

    // Automatycznie zapisz token po rejestracji
    if (response.data.data.token) {
      localStorage.setItem("userToken", response.data.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, credentials);

    // Automatycznie zapisz token po logowaniu
    if (response.data.data.token) {
      localStorage.setItem("userToken", response.data.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("Błąd podczas logowania:", error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userData");
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

export const isUserLoggedIn = () => {
  return !!getToken();
};

export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users/profile`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania profilu:", error);
    throw error;
  }
};

//program lojalnosciowy

export const getLoyaltyPoints = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/loyalty/points`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania punktów lojalnościowych:", error);
    throw error;
  }
};

export const getSpecialOffers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/loyalty/offers`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania ofert specjalnych:", error);
    throw error;
  }
};

export const redeemSpecialOffer = async (offerId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/loyalty/offers/${offerId}/redeem`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Błąd podczas wykorzystywania oferty ${offerId}:`, error);
    throw error;
  }
};

//preferencje uzytkownika

export const getUserPreferences = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/preferences`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania preferencji:", error);
    throw error;
  }
};

export const updateUserPreferences = async (preferences) => {
  try {
    const response = await axios.patch(`${BASE_URL}/preferences`, preferences, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas aktualizacji preferencji:", error);
    throw error;
  }
};

export const addFavoriteProduct = async (productId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/preferences/favorites`,
      { productId },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Błąd podczas dodawania do ulubionych:", error);
    throw error;
  }
};

export const removeFavoriteProduct = async (productId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/preferences/favorites/${productId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Błąd podczas usuwania z ulubionych:", error);
    throw error;
  }
};

export const getOrderHistory = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/preferences/orders`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania historii zamówień:", error);
    throw error;
  }
};

export const getSuggestedMenuItems = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/preferences/suggestions`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania sugestii menu:", error);
    throw error;
  }
};

//opinie

export const submitFeedback = async (feedbackData) => {
  try {
    const response = await axios.post(`${BASE_URL}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    console.error("Błąd podczas wysyłania opinii:", error);
    throw error;
  }
};

export const getAllFeedback = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/feedback`);
    return response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania opinii:", error);
    throw error;
  }
};

//payment api integracja

// Funkcja do dodania tokena użytkownika do płatności
export const addUserTokenToPayment = (paymentData) => {
  const token = getToken();
  if (token) {
    return {
      ...paymentData,
      userToken: token, // Dodaje token do payment request
    };
  }
  return paymentData; // Jeśli brak tokena (gość), zwraca bez zmian
};
