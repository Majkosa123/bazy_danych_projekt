import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductsByCategory } from "../api/menuApi";
import Spinner from "../components/common/Spinner";

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
        {products.map((product) => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="product-card"
          >
            <div className="product-image">
              <img
                src={`/images/products/${product.id}.jpg`}
                alt={product.name}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">{product.price.toFixed(2)} zł</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
