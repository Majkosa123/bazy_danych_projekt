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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState("medium");
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [addedExtras, setAddedExtras] = useState([]);
  const [spicyLevel, setSpicyLevel] = useState(0);
  const [cookingStyle, setCookingStyle] = useState("normal");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [allergyNotes, setAllergyNotes] = useState("");

  // Opcje dostosowania
  const customizationOptions = {
    sizes: [
      { id: "small", name: "Mały", priceModifier: -2.0 },
      { id: "medium", name: "Średni", priceModifier: 0.0 },
      { id: "large", name: "Duży", priceModifier: 3.0 },
      { id: "xl", name: "Extra Large", priceModifier: 5.0 },
    ],

    extras: [
      { id: "extra_cheese", name: "Dodatkowy ser", priceModifier: 2.5 },
      { id: "extra_meat", name: "Dodatkowe mięso", priceModifier: 8.0 },
      { id: "bacon", name: "Bekon", priceModifier: 3.5 },
      { id: "avocado", name: "Awokado", priceModifier: 4.0 },
      { id: "fried_egg", name: "Jajko sadzone", priceModifier: 2.0 },
      { id: "mushrooms", name: "Pieczarki", priceModifier: 2.5 },
      { id: "jalapeño", name: "Jalapeño", priceModifier: 1.5 },
    ],

    cookingStyles: [
      { id: "rare", name: "Krwisty", priceModifier: 0 },
      { id: "medium_rare", name: "Średnio krwisty", priceModifier: 0 },
      { id: "normal", name: "Normalnie wysmażony", priceModifier: 0 },
      { id: "well_done", name: "Dobrze wysmażony", priceModifier: 0 },
      { id: "crispy", name: "Ekstra chrupiący", priceModifier: 1.0 },
    ],
  };

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchProductDetails(productId);
        setProduct(data.data);
      } catch (err) {
        setError("Nie udało się załadować szczegółów produktu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productId]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 0 : numPrice;
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;

    let price = formatPrice(product.price) * quantity;

    // Rozmiar
    const size = customizationOptions.sizes.find((s) => s.id === selectedSize);
    if (size) price += size.priceModifier * quantity;

    // Dodatki
    addedExtras.forEach((extraId) => {
      const extra = customizationOptions.extras.find((e) => e.id === extraId);
      if (extra) price += extra.priceModifier * quantity;
    });

    // Styl gotowania
    const cooking = customizationOptions.cookingStyles.find(
      (c) => c.id === cookingStyle
    );
    if (cooking) price += cooking.priceModifier * quantity;

    // Poziom ostrości
    price += spicyLevel * 0.5 * quantity;

    return price;
  };

  const isApplicableOption = (optionType) => {
    if (!product) return false;
    const productName = product.name.toLowerCase();

    switch (optionType) {
      case "sizes":
        return productName.includes("burger") || productName.includes("frytki");
      case "cooking":
        return (
          productName.includes("burger") && !productName.includes("drobiowy")
        );
      case "spicy":
        return (
          !productName.includes("napoj") &&
          !productName.includes("deser") &&
          !productName.includes("lody")
        );
      case "extras":
        return productName.includes("burger");
      default:
        return true;
    }
  };

  const toggleExtra = (extraId) => {
    setAddedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  const toggleIngredientRemoval = (ingredient) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((ing) => ing !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Przygotuj customizacje
    const customizations = [];

    // Rozmiar
    const size = customizationOptions.sizes.find((s) => s.id === selectedSize);
    if (size && size.id !== "medium") {
      customizations.push({
        name: `Rozmiar: ${size.name}`,
        priceModifier: size.priceModifier,
      });
    }

    // Dodatki
    addedExtras.forEach((extraId) => {
      const extra = customizationOptions.extras.find((e) => e.id === extraId);
      if (extra) {
        customizations.push({
          name: extra.name,
          priceModifier: extra.priceModifier,
        });
      }
    });

    // Styl gotowania
    const cooking = customizationOptions.cookingStyles.find(
      (c) => c.id === cookingStyle
    );
    if (cooking && cooking.id !== "normal") {
      customizations.push({
        name: `Przygotowanie: ${cooking.name}`,
        priceModifier: cooking.priceModifier,
      });
    }

    // Poziom ostrości
    if (spicyLevel > 0) {
      customizations.push({
        name: `Ostrość: ${spicyLevel}/5 🌶️`,
        priceModifier: spicyLevel * 0.5,
      });
    }

    // Usunięte składniki
    if (removedIngredients.length > 0) {
      customizations.push({
        name: `Bez: ${removedIngredients.join(", ")}`,
        priceModifier: 0,
      });
    }

    // Przygotuj instrukcje specjalne
    let allInstructions = [];
    if (specialInstructions) allInstructions.push(specialInstructions);
    if (allergyNotes) allInstructions.push(`⚠️ Alergie: ${allergyNotes}`);

    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: formatPrice(product.price),
      quantity,
      customizations,
      specialInstructions: allInstructions.join(" | "),
      totalPrice: calculateTotalPrice(),
    };

    addToCart(itemToAdd);
    navigate("/cart");
  };

  if (loading) return <Spinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (!product)
    return <div className="error-message">Nie znaleziono produktu</div>;

  const basePrice = formatPrice(product.price);
  const totalPrice = calculateTotalPrice();

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
          <img
            src={`/images/products/${product.id}.jpg`}
            alt={product.name}
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+Cg==";
            }}
          />
        </div>

        <div className="product-info">
          <p className="description">{product.description}</p>
          <p className="price">Cena bazowa: {basePrice.toFixed(2)} zł</p>

          {/* CUSTOMIZACJE */}
          <div
            style={{
              border: "2px solid #ffbc0d",
              borderRadius: "12px",
              padding: "20px",
              margin: "20px 0",
              backgroundColor: "#fffdf5",
            }}
          >
            <h3 style={{ color: "#db0007", marginBottom: "15px" }}>
              🎛️ Dostosuj swoje zamówienie
            </h3>

            {/* Rozmiar */}
            {isApplicableOption("sizes") && (
              <div style={{ marginBottom: "20px" }}>
                <h4>📏 Rozmiar:</h4>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {customizationOptions.sizes.map((size) => (
                    <label
                      key={size.id}
                      style={{
                        padding: "10px",
                        border:
                          selectedSize === size.id
                            ? "2px solid #db0007"
                            : "1px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor:
                          selectedSize === size.id ? "#fff5f5" : "white",
                      }}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size.id}
                        checked={selectedSize === size.id}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        style={{ marginRight: "8px" }}
                      />
                      {size.name}
                      {size.priceModifier !== 0 && (
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          {size.priceModifier > 0 ? " +" : " "}
                          {size.priceModifier.toFixed(2)}zł
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Dodatki */}
            {isApplicableOption("extras") && (
              <div style={{ marginBottom: "20px" }}>
                <h4>➕ Dodatki:</h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {customizationOptions.extras.map((extra) => (
                    <label
                      key={extra.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px",
                        border: addedExtras.includes(extra.id)
                          ? "2px solid #4caf50"
                          : "1px solid #ddd",
                        borderRadius: "6px",
                        cursor: "pointer",
                        backgroundColor: addedExtras.includes(extra.id)
                          ? "#f8fff8"
                          : "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={addedExtras.includes(extra.id)}
                        onChange={() => toggleExtra(extra.id)}
                        style={{ marginRight: "8px" }}
                      />
                      <span style={{ flex: 1 }}>{extra.name}</span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          fontWeight: "bold",
                        }}
                      >
                        +{extra.priceModifier.toFixed(2)}zł
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Składniki do usunięcia */}
            {product.details && product.details.ingredients && (
              <div style={{ marginBottom: "20px" }}>
                <h4>➖ Usuń składniki:</h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {product.details.ingredients.map((ingredient, index) => (
                    <label
                      key={index}
                      style={{
                        padding: "6px 10px",
                        border: removedIngredients.includes(ingredient.name)
                          ? "2px solid #f44336"
                          : "1px solid #ddd",
                        borderRadius: "16px",
                        cursor: "pointer",
                        fontSize: "14px",
                        backgroundColor: removedIngredients.includes(
                          ingredient.name
                        )
                          ? "#ffebee"
                          : "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={removedIngredients.includes(ingredient.name)}
                        onChange={() =>
                          toggleIngredientRemoval(ingredient.name)
                        }
                        style={{ marginRight: "5px" }}
                      />
                      {ingredient.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Poziom ostrości */}
            {isApplicableOption("spicy") && (
              <div style={{ marginBottom: "20px" }}>
                <h4>🌶️ Poziom ostrości: {spicyLevel}/5</h4>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={spicyLevel}
                  onChange={(e) => setSpicyLevel(parseInt(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  <span>Łagodne</span>
                  <span>Średnie</span>
                  <span>Ostre 🔥</span>
                </div>
              </div>
            )}

            {/* Styl przygotowania */}
            {isApplicableOption("cooking") && (
              <div style={{ marginBottom: "20px" }}>
                <h4>🍳 Sposób przygotowania:</h4>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {customizationOptions.cookingStyles.map((style) => (
                    <label
                      key={style.id}
                      style={{
                        padding: "8px 12px",
                        border:
                          cookingStyle === style.id
                            ? "2px solid #db0007"
                            : "1px solid #ddd",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        backgroundColor:
                          cookingStyle === style.id ? "#fff5f5" : "white",
                      }}
                    >
                      <input
                        type="radio"
                        name="cooking"
                        value={style.id}
                        checked={cookingStyle === style.id}
                        onChange={(e) => setCookingStyle(e.target.value)}
                        style={{ marginRight: "6px" }}
                      />
                      {style.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instrukcje specjalne */}
          <div className="special-instructions">
            <h3>📝 Dodatkowe instrukcje:</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Np. bez cebuli, więcej sosu..."
              maxLength={200}
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <h4>⚠️ Uwagi dotyczące alergii:</h4>
            <textarea
              value={allergyNotes}
              onChange={(e) => setAllergyNotes(e.target.value)}
              placeholder="Np. alergia na gluten, laktozę, orzechy..."
              maxLength={200}
              style={{ width: "100%" }}
            />
          </div>

          <div className="quantity-selector">
            <h3>Ilość:</h3>
            <div className="quantity-controls">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div
            className="total-price"
            style={{
              padding: "15px",
              backgroundColor: "#f8fff8",
              border: "2px solid #4caf50",
              borderRadius: "8px",
              margin: "20px 0",
            }}
          >
            <h3>💰 Cena końcowa: {totalPrice.toFixed(2)} zł</h3>
            {totalPrice !== basePrice * quantity && (
              <p style={{ fontSize: "14px", color: "#666" }}>
                (Cena bazowa: {(basePrice * quantity).toFixed(2)} zł +
                modyfikacje: +{(totalPrice - basePrice * quantity).toFixed(2)}{" "}
                zł)
              </p>
            )}
          </div>

          <button onClick={handleAddToCart} className="add-to-cart-button">
            Dodaj do koszyka - {totalPrice.toFixed(2)} zł
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
