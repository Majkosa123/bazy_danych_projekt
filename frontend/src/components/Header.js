import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const Header = () => {
  const { cart, totalPrice } = useContext(CartContext);
  const location = useLocation();

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (location.pathname === "/thank-you") {
    return null;
  }

  return (
    <header
      style={{
        backgroundColor: "#ffbc0d",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div>
        <Link
          to="/"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#292929",
            textDecoration: "none",
          }}
        >
          🍔 McDonald's
        </Link>
      </div>

      <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            color: "#292929",
            textDecoration: "none",
            fontWeight: location.pathname === "/" ? "bold" : "normal",
            padding: "8px 12px",
            borderRadius: "4px",
            backgroundColor:
              location.pathname === "/"
                ? "rgba(255,255,255,0.2)"
                : "transparent",
          }}
        >
          🏠 Menu
        </Link>

        <Link
          to="/cart"
          style={{
            position: "relative",
            backgroundColor: cart.length > 0 ? "#00A215" : "#666",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            textDecoration: "none",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            transform: cart.length > 0 ? "scale(1.05)" : "scale(1)",
          }}
        >
          🛒 Koszyk
          {itemCount > 0 && (
            <span
              style={{
                backgroundColor: "white",
                color: "#00A215",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
                animation: itemCount > 0 ? "pulse 0.5s ease-in-out" : "none",
              }}
            >
              {itemCount}
            </span>
          )}
        </Link>

        {cart.length > 0 && (
          <div
            style={{
              color: "#292929",
              fontWeight: "bold",
              fontSize: "16px",
              padding: "8px 12px",
              backgroundColor: "rgba(255,255,255,0.3)",
              borderRadius: "8px",
            }}
          >
            {(parseFloat(totalPrice) || 0).toFixed(2)} zł
          </div>
        )}
      </nav>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </header>
  );
};

export default Header;
