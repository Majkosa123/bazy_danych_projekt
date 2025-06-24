const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/sequelize/user");
const LoyaltyPointsHistory = require("../models/sequelize/loyaltyPointsHistory");
const UserPreferences = require("../models/mongoose/userPreferences");
const { sequelize } = require("../config/database");

exports.register = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error("Użytkownik z tym adresem email już istnieje");
      error.statusCode = 400;
      return next(error);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create(
      {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
      },
      { transaction }
    );

    await LoyaltyPointsHistory.create(
      {
        userId: user.id,
        pointsChange: 50,
        type: "bonus",
        description: "Punkty powitalne za rejestrację",
      },
      { transaction }
    );

    await User.update(
      { loyaltyPoints: 50 },
      {
        where: { id: user.id },
        transaction,
      }
    );

    await transaction.commit();

    try {
      await UserPreferences.create({
        userId: user.id,
      });
    } catch (mongoError) {
      console.error("Błąd podczas tworzenia preferencji:", mongoError);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const updatedUser = await User.findByPk(user.id);
    const userResponse = updatedUser.toJSON();
    delete userResponse.passwordHash;

    res.status(201).json({
      status: "success",
      message: "Użytkownik został zarejestrowany",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("Nieprawidłowy email lub hasło");
      error.statusCode = 401;
      return next(error);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error("Nieprawidłowy email lub hasło");
      error.statusCode = 401;
      return next(error);
    }

    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    res.status(200).json({
      status: "success",
      message: "Logowanie zakończone sukcesem",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: LoyaltyPointsHistory,
          limit: 10,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!user) {
      const error = new Error("Nie znaleziono użytkownika");
      error.statusCode = 404;
      return next(error);
    }

    const preferences = await UserPreferences.findOne({ userId: req.userId });

    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    res.status(200).json({
      status: "success",
      data: {
        user: userResponse,
        preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};
