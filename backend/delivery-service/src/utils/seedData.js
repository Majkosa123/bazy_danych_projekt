const DeliveryOption = require("../models/sequelize/deliveryOption");
const Table = require("../models/sequelize/table");

const seedDeliveryOptions = async () => {
  try {
    const deliveryOptions = [
      {
        name: "Na miejscu",
        description: "Zamówienie do stolika w restauracji",
        isActive: true,
        estimatedTimeMinutes: 15,
      },
      {
        name: "Na wynos",
        description: "Odbiór osobisty z restauracji",
        isActive: true,
        estimatedTimeMinutes: 10,
      },
      {
        name: "Dostawa",
        description: "Dostawa do domu kurierem",
        isActive: true,
        estimatedTimeMinutes: 30,
      },
    ];

    const count = await DeliveryOption.count();
    if (count === 0) {
      await DeliveryOption.bulkCreate(deliveryOptions);
      console.log("Dodano przykładowe opcje dostawy");
    } else {
      console.log("Opcje dostawy już istnieją, pomijam dodawanie");
    }
  } catch (error) {
    console.error("Błąd podczas dodawania opcji dostawy:", error);
  }
};

const seedTables = async () => {
  try {
    const tables = [
      { number: 1, capacity: 2, isAvailable: false, location: "Przy oknie" },
      { number: 2, capacity: 4, isAvailable: true, location: "Środek sali" },
      { number: 3, capacity: 2, isAvailable: true, location: "Przy ścianie" },
      { number: 4, capacity: 6, isAvailable: true, location: "Duży stół" },
      { number: 5, capacity: 4, isAvailable: true, location: "Środek sali" },
      { number: 6, capacity: 2, isAvailable: false, location: "Zajęty" },
    ];

    const count = await Table.count();
    if (count === 0) {
      await Table.bulkCreate(tables);
      console.log("Dodano przykładowe stoliki");
    } else {
      console.log("Stoliki już istnieją, pomijam dodawanie");
    }
  } catch (error) {
    console.error("Błąd podczas dodawania stolików:", error);
  }
};

const seedAll = async () => {
  await seedDeliveryOptions();
  await seedTables();
  console.log("Inicjalizacja danych delivery service zakończona");
};

module.exports = { seedAll };
