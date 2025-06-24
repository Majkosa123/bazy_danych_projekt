const jwt = require("jsonwebtoken");
const User = require("../models/sequelize/user");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      const error = new Error("Brak tokena autoryzacji");
      error.statusCode = 401;
      return next(error);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //czy użytkownik nadal istnieje i jest aktywny
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        isActive: true,
      },
    });

    if (!user) {
      const error = new Error("Nieprawidłowy token lub użytkownik nieaktywny");
      error.statusCode = 401;
      return next(error);
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      error.message = "Nieprawidłowy token";
      error.statusCode = 401;
    } else if (error.name === "TokenExpiredError") {
      error.message = "Token wygasł";
      error.statusCode = 401;
    } else {
      error.message = "Błąd podczas autoryzacji";
      error.statusCode = 500;
    }
    next(error);
  }
};

module.exports = {
  authenticateToken,
};
