import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductDetails } from "../api/menuApi";
import { CartContext } from "../context/CartContext";
import Spinner from "../components/common/Spinner";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchProductDetails(productId);
        setProduct(data.data);

        // Inicjalizacja customizacji na podstawie dostępnych opcji
        if (data.data.details && data.data.details.customizationOptions) {
          setCustomizations(
            data.data.details.customizationOptions.map((option) => ({
              name: option.name,
              selected: false,
              priceModifier: option.priceModifier,
            }))
          );
        }
      } catch (err) {
        setError("Nie udało się załadować szczegółów produktu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productId]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const toggleCustomization = (index) => {
    const newCustomizations = [...customizations];
    newCustomizations[index].selected = !newCustomizations[index].selected;
    setCustomizations(newCustomizations);
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;

    let price = product.price * quantity;

    // Dodaj modyfikatory ceny z wybranych customizacji
    customizations.forEach((option) => {
      if (option.selected) {
        price += option.priceModifier * quantity;
      }
    });

    return price;
  };

  const handleAddToCart = () => {
    if (!product) return;

    const selectedCustomizations = customizations
      .filter((option) => option.selected)
      .map((option) => ({
        name: option.name,
        priceModifier: option.priceModifier,
      }));

    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      customizations: selectedCustomizations,
      specialInstructions,
      totalPrice: calculateTotalPrice(),
    };

    addToCart(itemToAdd);
    navigate("/cart");
  };

  if (loading) return <Spinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (!product)
    return <div className="error-message">Nie znaleziono produktu</div>;

  return (
    <div className="product-details-page">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Powrót
        </button>
        <h1>{product.name}</h1>
      </div>

      <div className="product-content">
        <div className="product-image">
          <img src={`/images/products/${product.id}.jpg`} alt={product.name} />
        </div>

        <div className="product-info">
          <p className="description">{product.description}</p>
          <p className="price">Cena: {product.price.toFixed(2)} zł</p>

          {product.details && product.details.ingredients && (
            <div className="ingredients">
              <h3>Składniki:</h3>
              <ul>
                {product.details.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.name}
                    {ingredient.isAllergen && (
                      <span className="allergen"> (Alergen)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {customizations.length > 0 && (
            <div className="customizations">
              <h3>Dostosuj swój produkt:</h3>
              <ul>
                {customizations.map((option, index) => (
                  <li key={index}>
                    <label className="customization-option">
                      <input
                        type="checkbox"
                        checked={option.selected}
                        onChange={() => toggleCustomization(index)}
                      />
                      <span>
                        {option.name}
                        {option.priceModifier > 0 && (
                          <span className="price-modifier">
                            {" "}
                            +{option.priceModifier.toFixed(2)} zł
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="special-instructions">
            <h3>Dodatkowe instrukcje:</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Np. bez cebuli, więcej sosu..."
              maxLength={200}
            />
          </div>

          <div className="quantity-selector">
            <h3>Ilość:</h3>
            <div className="quantity-controls">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          <div className="total-price">
            <h3>Razem: {calculateTotalPrice().toFixed(2)} zł</h3>
          </div>

          <button onClick={handleAddToCart} className="add-to-cart-button">
            Dodaj do koszyka
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
