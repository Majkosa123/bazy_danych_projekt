const serviceAuthOnly = (req, res, next) => {
  const serviceKey = req.headers["x-service-auth"];

  if (serviceKey === process.env.SYSTEM_JWT_TOKEN) {
    req.isServiceCall = true;
    next();
  } else {
    const error = new Error("Dostęp tylko dla serwisów systemowych");
    error.statusCode = 403;
    next(error);
  }
};

module.exports = { serviceAuthOnly };
