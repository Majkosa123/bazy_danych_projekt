import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../api/menuApi";
import {
  getCategoryImagePath,
  getDefaultCategoryImage,
} from "../utils/imageHelper";
import Spinner from "../components/common/Spinner";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(
          "Nie udało się załadować kategorii. Proszę spróbować ponownie."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleImageError = (e, categoryName) => {
    console.log(`Nie znaleziono obrazka dla kategorii: ${categoryName}`);
    e.target.src = getDefaultCategoryImage();
  };

  if (loading) return <Spinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-page">
      <h1>Wybierz kategorię</h1>
      <div className="categories-grid">
        {categories.map((category) => {
          const imagePath = getCategoryImagePath(category.name);

          return (
            <Link
              to={`/menu/${category.id}`}
              key={category.id}
              className="category-card"
            >
              <div className="category-image">
                <img
                  src={imagePath}
                  alt={category.name}
                  onError={(e) => handleImageError(e, category.name)}
                />
              </div>
              <h2>{category.name}</h2>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default HomePage;
