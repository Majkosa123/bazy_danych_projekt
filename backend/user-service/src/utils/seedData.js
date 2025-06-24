const SpecialOffer = require("../models/sequelize/specialOffer");

const seedSpecialOffers = async () => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 2);

    const offers = [
      {
        title: "10% zniżki dla członków",
        description:
          "Zniżka 10% na całe zamówienie dla posiadaczy 100+ punktów",
        discountType: "percentage",
        discountValue: 10.0,
        minLoyaltyPoints: 100,
        minOrderValue: 30.0,
        pointsCost: 50,
        validFrom: startDate,
        validTo: endDate,
        isActive: true,
        usageLimit: 1000,
        usageCount: 0,
      },
      {
        title: "Darmowe frytki",
        description: "Darmowa porcja frytek do zamówienia",
        discountType: "fixed",
        discountValue: 7.99,
        minLoyaltyPoints: 50,
        minOrderValue: 20.0,
        pointsCost: 30,
        validFrom: startDate,
        validTo: endDate,
        isActive: true,
        usageLimit: 500,
        usageCount: 0,
      },
      {
        title: "VIP 20% zniżki",
        description: "Ekskluzywna zniżka 20% dla stałych klientów",
        discountType: "percentage",
        discountValue: 20.0,
        minLoyaltyPoints: 500,
        minOrderValue: 50.0,
        pointsCost: 200,
        validFrom: startDate,
        validTo: endDate,
        isActive: true,
        usageLimit: 100,
        usageCount: 0,
      },
      {
        title: "Darmowy napój",
        description: "Bezpłatny napój do każdego zamówienia",
        discountType: "fixed",
        discountValue: 5.99,
        minLoyaltyPoints: 25,
        minOrderValue: 15.0,
        pointsCost: 20,
        validFrom: startDate,
        validTo: endDate,
        isActive: true,
        usageLimit: 200,
        usageCount: 0,
      },
    ];

    const count = await SpecialOffer.count();
    if (count === 0) {
      await SpecialOffer.bulkCreate(offers);
      console.log("Dodano przykładowe oferty specjalne");
    } else {
      console.log("Oferty specjalne już istnieją, pomijam dodawanie");
    }
  } catch (error) {
    console.error("Błąd podczas dodawania ofert specjalnych:", error);
  }
};

const seedAll = async () => {
  await seedSpecialOffers();
  console.log("Inicjalizacja danych user-service zakończona");
};

module.exports = { seedAll };
