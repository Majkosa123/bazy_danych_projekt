const PaymentMethod = require("../models/sequelize/paymentMethod");
const PromoCode = require("../models/sequelize/promoCode");

const seedPaymentMethods = async () => {
  try {
    const paymentMethods = [
      {
        name: "card",
        description: "Płatność kartą kredytową lub debetową",
        isActive: true,
        processingFee: 0.0,
      },
      {
        name: "cash",
        description: "Płatność gotówką przy odbiorze",
        isActive: true,
        processingFee: 0.0,
      },
      {
        name: "mobile_app",
        description: "Płatność przez aplikację mobilną restauracji",
        isActive: true,
        processingFee: 0.0,
      },
    ];

    const count = await PaymentMethod.count();
    if (count === 0) {
      await PaymentMethod.bulkCreate(paymentMethods);
      console.log("Dodano przykładowe metody płatności");
    } else {
      console.log("Metody płatności już istnieją, pomijam dodawanie");
    }
  } catch (error) {
    console.error("Błąd podczas dodawania metod płatności:", error);
  }
};

const seedPromoCodes = async () => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const promoCodes = [
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10.0,
        minOrderValue: 50.0,
        startDate,
        endDate,
        isActive: true,
        usageLimit: 1000,
        usageCount: 0,
      },
      {
        code: "FIXED20",
        discountType: "fixed",
        discountValue: 20.0,
        minOrderValue: 80.0,
        startDate,
        endDate,
        isActive: true,
        usageLimit: 500,
        usageCount: 0,
      },
      {
        code: "SUMMER25",
        discountType: "percentage",
        discountValue: 25.0,
        minOrderValue: 100.0,
        startDate,
        endDate,
        isActive: true,
        usageLimit: 300,
        usageCount: 0,
      },
    ];

    const count = await PromoCode.count();
    if (count === 0) {
      await PromoCode.bulkCreate(promoCodes);
      console.log("Dodano przykładowe kody promocyjne");
    } else {
      console.log("Kody promocyjne już istnieją, pomijam dodawanie");
    }
  } catch (error) {
    console.error("Błąd podczas dodawania kodów promocyjnych:", error);
  }
};

const seedAll = async () => {
  await seedPaymentMethods();
  await seedPromoCodes();
  console.log("Inicjalizacja danych zakończona");
};

module.exports = { seedAll };
