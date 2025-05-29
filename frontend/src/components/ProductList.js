import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductsByCategory } from "../api/menuApi";
import {
  getProductImagePath,
  getDefaultProductImage,
} from "../utils/imageHelper";
import Spinner from "./common/Spinner";

function ProductList() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProductsByCategory(categoryId);
        setProducts(data.data);
        setCategoryName(data.data[0]?.Category?.name || "Produkty");
      } catch (err) {
        setError(
          "Nie udało się załadować produktów. Proszę spróbować ponownie."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryId]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const getAvailabilityIcon = (isAvailable) => {
    if (isAvailable) {
      return {
        icon: "✅",
        text: "Dostępny",
        className: "availability-available",
      };
    } else {
      return {
        icon: "❌",
        text: "Niedostępny",
        className: "availability-unavailable",
      };
    }
  };

  const handleImageError = (e, productName) => {
    console.log(`Nie znaleziono obrazka dla: ${productName}`);
    e.target.src = getDefaultProductImage();
  };

  if (loading) return <Spinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="product-list-page">
      <div className="header">
        <Link to="/" className="back-button">
          ← Powrót
        </Link>
        <h1>{categoryName}</h1>
      </div>

      <div className="products-grid">
        {products.map((product) => {
          const availability = getAvailabilityIcon(product.isAvailable);
          const imagePath = getProductImagePath(
            product.name,
            product.Category?.name
          );

          return (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className={`product-card ${
                !product.isAvailable ? "unavailable" : ""
              }`}
            >
              <div className="product-image">
                <img
                  src={imagePath}
                  alt={product.name}
                  onError={(e) => handleImageError(e, product.name)}
                />

                {/* Ikona dostępności w prawym górnym rogu */}
                <div className={`availability-badge ${availability.className}`}>
                  <span className="availability-icon" title={availability.text}>
                    {availability.icon}
                  </span>
                </div>

                {/* Overlay dla niedostępnych produktów */}
                {!product.isAvailable && (
                  <div className="unavailable-overlay">
                    <span className="unavailable-text">Niedostępny</span>
                  </div>
                )}
              </div>

              <div className="product-info">
                <h3
                  className={
                    !product.isAvailable ? "product-name-unavailable" : ""
                  }
                >
                  {product.name}
                </h3>
                <div className="product-price-and-status">
                  <p className="price">{formatPrice(product.price)} zł</p>
                  <div
                    className={`availability-status ${availability.className}`}
                  >
                    <span className="availability-text">
                      {availability.icon} {availability.text}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {products.length === 0 && !loading && (
        <div className="no-products">
          <p>Brak produktów w tej kategorii.</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;
