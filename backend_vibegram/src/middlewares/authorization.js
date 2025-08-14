import jwt from "jsonwebtoken";
import User from "../models/User.js";
import HttpException from "../utils/HttpException.js";

const { JWT_SECRET } = process.env;

export const authenticate = async (req, res, next) => {
  try {
    // 1) Достаём токен из cookie ИЛИ из Authorization
    const bearer = req.headers.authorization;
    const headerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7).trim() : null;
    const token = req.cookies?.token || headerToken;

    if (!token) return next(HttpException(401, "Токен не найден"));
    if (!JWT_SECRET) return next(HttpException(500, "JWT secret не задан"));

    // 2) Проверяем подпись токена
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return next(HttpException(401, "Невалидный или просроченный токен"));
    }

    // 3) Ищем пользователя
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(HttpException(401, "Пользователь не найден"));

    // 4) (опционально) проверка совпадения с токеном в БД
    // если хочешь строгую одно-сессию-модель — оставь; иначе убери
    if (user.token && user.token !== token) {
      return next(HttpException(401, "Токен недействителен"));
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error("[authenticate] unexpected:", err);
    return next(HttpException(500, "Auth middleware error"));
  }
};
