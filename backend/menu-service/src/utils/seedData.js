const Category = require("../models/sequelize/category");
const Product = require("../models/sequelize/product");
const ProductDetail = require("../models/mongoose/productDetail");

const seedCategories = async () => {
  try {
    const categories = [
      {
        name: "Burgery",
        description: "Nasze pyszne burgery",
        isActive: true,
      },
      {
        name: "Frytki i dodatki",
        description: "Chrupiące frytki i inne dodatki",
        isActive: true,
      },
      {
        name: "Napoje",
        description: "Zimne i gorące napoje",
        isActive: true,
      },
      {
        name: "Desery",
        description: "Słodkie przysmaki",
        isActive: true,
      },
    ];

    const count = await Category.count();
    if (count === 0) {
      const createdCategories = await Category.bulkCreate(categories);
      console.log("Dodano przykładowe kategorie");
      return createdCategories;
    } else {
      console.log("Kategorie już istnieją, pomijam dodawanie");
      return await Category.findAll();
    }
  } catch (error) {
    console.error("Błąd podczas dodawania kategorii:", error);
    throw error;
  }
};

const seedProducts = async (categories) => {
  try {
    if (!categories || categories.length === 0) {
      categories = await Category.findAll();
      if (categories.length === 0) {
        throw new Error("Brak kategorii do przypisania produktów");
      }
    }

    const categoryMap = categories.reduce((map, category) => {
      map[category.name] = category.id;
      return map;
    }, {});

    const products = [
      // Burgery
      {
        name: "Big Mac",
        description: "Soczysty burger wołowy z sałatą, pomidorem i cebulą",
        price: 15.99,
        isAvailable: true,
        categoryId: categoryMap["Burgery"],
      },
      {
        name: "Cheeseburger",
        description: "Burger wołowy z serem, sałatą i sosem",
        price: 17.99,
        isAvailable: true,
        categoryId: categoryMap["Burgery"],
      },
      {
        name: "McChicken",
        description:
          "Delikatny burger z kurczaka z sałatą i sosem musztardowym",
        price: 16.99,
        isAvailable: true,
        categoryId: categoryMap["Burgery"],
      },
      {
        name: "Burger Drwala",
        description:
          "Delikatny burger z wołowy z serem camembert w panierce, sałatą, smazoną cebulką i sosem majonezowym",
        price: 16.99,
        isAvailable: false,
        categoryId: categoryMap["Burgery"],
      },

      // Frytki i dodatki
      {
        name: "Frytki małe",
        description: "Porcja chrupiących frytek",
        price: 5.99,
        isAvailable: true,
        categoryId: categoryMap["Frytki i dodatki"],
      },
      {
        name: "Frytki duże",
        description: "Duża porcja chrupiących frytek",
        price: 7.99,
        isAvailable: true,
        categoryId: categoryMap["Frytki i dodatki"],
      },
      {
        name: "McNuggets",
        description: "6 sztuk nuggetsów z kurczaka",
        price: 9.99,
        isAvailable: true,
        categoryId: categoryMap["Frytki i dodatki"],
      },

      // Napoje
      {
        name: "Coca-Cola",
        description: "Orzeźwiająca cola 0.5l",
        price: 5.99,
        isAvailable: true,
        categoryId: categoryMap["Napoje"],
      },
      {
        name: "Woda mineralna",
        description: "Woda mineralna 0.5l",
        price: 3.99,
        isAvailable: true,
        categoryId: categoryMap["Napoje"],
      },
      {
        name: "Kawa",
        description: "Świeżo parzona kawa",
        price: 6.99,
        isAvailable: true,
        categoryId: categoryMap["Napoje"],
      },

      // Desery
      {
        name: "McFlurry",
        description: "Kremowe lody waniliowe",
        price: 9.99,
        isAvailable: true,
        categoryId: categoryMap["Desery"],
      },
      {
        name: "Ciastko jabłkowe",
        description: "Domowa szarlotka z jabłkami",
        price: 8.99,
        isAvailable: true,
        categoryId: categoryMap["Desery"],
      },
    ];

    const count = await Product.count();
    if (count === 0) {
      const createdProducts = await Product.bulkCreate(products);
      console.log("Dodano przykładowe produkty");
      return createdProducts;
    } else {
      console.log("Produkty już istnieją, pomijam dodawanie");
      return await Product.findAll();
    }
  } catch (error) {
    console.error("Błąd podczas dodawania produktów:", error);
    throw error;
  }
};

const seedProductDetails = async (products) => {
  try {
    if (!products || products.length === 0) {
      products = await Product.findAll();
      if (products.length === 0) {
        throw new Error("Brak produktów do przypisania szczegółów");
      }
    }

    for (const product of products) {
      const existingDetails = await ProductDetail.findOne({
        productId: product.id,
      });

      if (existingDetails) {
        continue;
      }

      let ingredients = [];
      let nutritionalValues = {};
      let allergens = [];

      const productName = product.name.toLowerCase();

      // BURGERY - rozpoznawanie po konkretnych nazwach
      if (
        productName.includes("big mac") ||
        productName.includes("cheeseburger") ||
        productName.includes("burger drwala")
      ) {
        ingredients = [
          { name: "Bułka", isAllergen: true },
          { name: "Mięso wołowe", isAllergen: false },
          { name: "Sałata", isAllergen: false },
          { name: "Pomidor", isAllergen: false },
          { name: "Cebula", isAllergen: false },
        ];

        // Dodatkowe składniki dla konkretnych burgerów
        if (
          productName.includes("cheeseburger") ||
          productName.includes("big mac")
        ) {
          ingredients.push({ name: "Ser", isAllergen: true });
          allergens.push("Laktoza");
        }

        if (productName.includes("burger drwala")) {
          ingredients.push({ name: "Ser camembert", isAllergen: true });
          ingredients.push({ name: "Smażona cebulka", isAllergen: false });
          allergens.push("Laktoza");
        }

        allergens.push("Gluten");
        nutritionalValues = {
          calories: 450,
          protein: 25,
          carbohydrates: 45,
          fat: 20,
        };

        // MCCHICKEN - burger drobiowy
      } else if (productName.includes("mcchicken")) {
        ingredients = [
          { name: "Bułka", isAllergen: true },
          { name: "Mięso z kurczaka", isAllergen: false },
          { name: "Sałata", isAllergen: false },
          { name: "Sos musztardowy", isAllergen: true },
        ];
        allergens = ["Gluten", "Gorczyca"];
        nutritionalValues = {
          calories: 400,
          protein: 22,
          carbohydrates: 40,
          fat: 18,
        };

        // FRYTKI
      } else if (productName.includes("frytki")) {
        ingredients = [
          { name: "Ziemniaki", isAllergen: false },
          { name: "Olej roślinny", isAllergen: false },
          { name: "Sól", isAllergen: false },
        ];
        nutritionalValues = {
          calories: productName.includes("małe") ? 230 : 350,
          protein: 4,
          carbohydrates: productName.includes("małe") ? 30 : 45,
          fat: productName.includes("małe") ? 10 : 15,
        };

        // MCNUGGETS
      } else if (
        productName.includes("mcnuggets") ||
        productName.includes("nuggets")
      ) {
        ingredients = [
          { name: "Mięso z kurczaka", isAllergen: false },
          { name: "Panierka", isAllergen: true },
          { name: "Olej roślinny", isAllergen: false },
        ];
        allergens = ["Gluten"];
        nutritionalValues = {
          calories: 300,
          protein: 15,
          carbohydrates: 18,
          fat: 20,
        };

        // COCA-COLA
      } else if (
        productName.includes("coca-cola") ||
        productName.includes("cola")
      ) {
        ingredients = [
          { name: "Woda gazowana", isAllergen: false },
          { name: "Cukier", isAllergen: false },
          { name: "Barwnik karmel", isAllergen: false },
          { name: "Kwas fosforowy", isAllergen: false },
          { name: "Aromaty", isAllergen: false },
        ];
        nutritionalValues = {
          calories: 210,
          protein: 0,
          carbohydrates: 53,
          fat: 0,
        };

        // WODA MINERALNA
      } else if (productName.includes("woda")) {
        ingredients = [{ name: "Woda mineralna", isAllergen: false }];
        nutritionalValues = {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
        };

        // KAWA
      } else if (productName.includes("kawa")) {
        ingredients = [
          { name: "Kawa", isAllergen: false },
          { name: "Woda", isAllergen: false },
        ];
        nutritionalValues = {
          calories: 5,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
        };

        // MCFLURRY
      } else if (
        productName.includes("mcflurry") ||
        productName.includes("lody")
      ) {
        ingredients = [
          { name: "Mleko", isAllergen: true },
          { name: "Śmietana", isAllergen: true },
          { name: "Cukier", isAllergen: false },
          { name: "Wanilia", isAllergen: false },
        ];
        allergens = ["Laktoza"];
        nutritionalValues = {
          calories: 180,
          protein: 3,
          carbohydrates: 20,
          fat: 9,
        };

        // CIASTKO JABŁKOWE
      } else if (
        productName.includes("ciastko") ||
        productName.includes("jabłkowe")
      ) {
        ingredients = [
          { name: "Mąka", isAllergen: true },
          { name: "Masło", isAllergen: true },
          { name: "Cukier", isAllergen: false },
          { name: "Jabłka", isAllergen: false },
          { name: "Cynamon", isAllergen: false },
        ];
        allergens = ["Gluten", "Laktoza"];
        nutritionalValues = {
          calories: 320,
          protein: 2,
          carbohydrates: 45,
          fat: 15,
        };
      }

      // dodawanie szczegółow jeśli mamy składniki
      if (ingredients.length > 0) {
        await ProductDetail.create({
          productId: product.id,
          ingredients,
          nutritionalValues,
          allergens,
        });
        console.log(`Dodano szczegóły dla produktu: ${product.name}`);
      }
    }

    console.log("Dodano szczegóły produktów");
  } catch (error) {
    console.error("Błąd podczas dodawania szczegółów produktów:", error);
    throw error;
  }
};

const seedAll = async () => {
  try {
    const categories = await seedCategories();
    const products = await seedProducts(categories);
    await seedProductDetails(products);
    console.log("Inicjalizacja danych menu zakończona pomyślnie");
  } catch (error) {
    console.error("Błąd podczas inicjalizacji danych:", error);
    throw error;
  }
};

module.exports = { seedAll };
