const axios = require("axios");

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:3005";

const addLoyaltyPointsForOrder = async (userId, orderAmount, orderId) => {
  try {
    const pointsToAdd = Math.floor(orderAmount / 10);

    const response = await axios.post(
      `${USER_SERVICE_URL}/api/v1/loyalty/points`,
      {
        pointsChange: pointsToAdd,
        type: "earned",
        orderId,
        description: `Punkty za zamówienie #${orderId}`,
        userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Service-Auth": process.env.SYSTEM_JWT_TOKEN,
        },
      }
    );

    console.log(`Dodano ${pointsToAdd} punktów dla użytkownika ${userId}`);
    return response.data;
  } catch (error) {
    console.error("Błąd podczas dodawania punktów:", error.message);
  }
};

module.exports = {
  addLoyaltyPointsForOrder,
};
