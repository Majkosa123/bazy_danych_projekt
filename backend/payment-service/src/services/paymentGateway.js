const { v4: uuidv4 } = require("uuid");

class PaymentGateway {
  constructor() {
    this.supportedMethods = ["card", "mobile_app", "cash"];
  }

  async processPayment(method, amount, currency = "PLN") {
    return new Promise((resolve, reject) => {
      if (!this.supportedMethods.includes(method)) {
        return reject(new Error(`Nieprawidłowa metoda płatności: ${method}`));
      }

      const processingTime = Math.floor(Math.random() * 1000) + 1000;

      setTimeout(() => {
        const isSuccessful = Math.random() < 0.95;

        if (isSuccessful) {
          resolve({
            success: true,
            transactionId: uuidv4(),
            amount,
            currency,
            timestamp: new Date().toISOString(),
          });
        } else {
          reject(
            new Error("Płatność została odrzucona przez bramkę płatniczą")
          );
        }
      }, processingTime);
    });
  }

  async generateReceipt(paymentData, orderData) {
    return {
      receiptNumber: `RCP-${Date.now().toString().substring(5)}`,
      transactionId: paymentData.transactionId,
      issueDate: new Date().toISOString(),
      ...paymentData,
      orderDetails: orderData,
    };
  }
}

module.exports = new PaymentGateway();
