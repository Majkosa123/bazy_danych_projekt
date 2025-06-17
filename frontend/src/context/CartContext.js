import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // do parsowania liczb
  const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Sprawdź czy dane są prawidłowe
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error("Błąd podczas ładowania koszyka:", error);
      localStorage.removeItem("cart"); // Usuń uszkodzone dane
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));

      const total = cart.reduce((sum, item) => {
        return sum + safeParseFloat(item.totalPrice);
      }, 0);
      setTotalPrice(total);
    } catch (error) {
      console.error("Błąd podczas zapisywania koszyka:", error);
    }
  }, [cart]);

  const addToCart = (item) => {
    const validatedItem = {
      ...item,
      price: safeParseFloat(item.price),
      quantity: parseInt(item.quantity) || 1,
      totalPrice: safeParseFloat(item.totalPrice),
      customizations: item.customizations || [],
      specialInstructions: item.specialInstructions || "",
    };

    setCart((prevCart) => [...prevCart, validatedItem]);
  };

  const removeFromCart = (index) => {
    if (index >= 0 && index < cart.length) {
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1 || index < 0 || index >= cart.length) return;

    const newCart = [...cart];
    const item = newCart[index];

    const basePrice = safeParseFloat(item.price);
    const customizationsPrice = (item.customizations || []).reduce(
      (sum, customization) => sum + safeParseFloat(customization.priceModifier),
      0
    );

    const newTotalPrice = (basePrice + customizationsPrice) * newQuantity;

    newCart[index] = {
      ...item,
      quantity: newQuantity,
      totalPrice: newTotalPrice,
    };

    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
