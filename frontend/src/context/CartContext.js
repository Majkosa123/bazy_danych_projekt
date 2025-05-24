import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));

    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotalPrice(total);
  }, [cart]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;

    const newCart = [...cart];
    const item = newCart[index];

    const basePrice = item.price;

    const customizationsPrice = item.customizations.reduce(
      (sum, customization) => sum + customization.priceModifier,
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
