// src/controllers/auth.controller.js
import * as authService from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import HttpException from "../utils/HttpException.js";

const { JWT_SECRET } = process.env;

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure: false, // в проде лучше true + https
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signToken = (user) =>
  jwt.sign({ id: user._id?.toString?.(), role: user.role }, JWT_SECRET, { expiresIn: "7d" });

const toSafeUser = (u) => ({
  id: u._id,
  username: u.username,
  email: u.email,
  avatar: u.avatar,
  role: u.role,
});

// ---------- CONTROLLERS ----------

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    const user = result?.user || result;

    let token = result?.token;
    if (!token) {
      if (!user?._id) return next(HttpException(500, "Register must return user with _id or token"));
      token = signToken(user);
    }

    res.cookie("token", token, COOKIE_OPTS);
    return res.status(200).json({ user: toSafeUser(user), token });
  } catch (err) {
    console.error("❌ Ошибка в register:", err);
    return next(HttpException(err.status || 500, err.message || "Ошибка при регистрации"));
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    const user = result.user;
    const token = typeof result.token === "string" ? result.token : signToken(user);

    res.cookie("token", token, COOKIE_OPTS);
    return res.status(201).json({ user: toSafeUser(user), token });
  } catch (err) {
    console.error("❌ Ошибка в login:", err);
    return next(HttpException(err.status || 500, err.message || "Ошибка при входе"));
  }
};

export const getCurrent = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Не авторизован" });
    return res.status(200).json({ user: toSafeUser(req.user) });
  } catch (err) {
    return next(HttpException(err.status || 500, err.message || "Ошибка при получении пользователя"));
  }
};

export const logout = async (req, res, next) => {
  try {
    if (authService.logout) await authService.logout(req.body.user);
    res.clearCookie("token", COOKIE_OPTS);
    return res.json({ message: "Выход выполнен" });
  } catch (err) {
    return next(HttpException(err.status || 500, err.message || "Ошибка при выходе"));
  }
};

/**
 * POST /api/auth/reset-request
 * Принимает: { emailOrUsername } ИЛИ { email } ИЛИ { username }
 * Ищет пользователя по email/username, генерирует reset token и отдаёт 200.
 */
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email, username, emailOrUsername } = req.body;
    const raw = (emailOrUsername ?? email ?? username ?? "").trim();
    if (!raw) return next(HttpException(400, "Введите email или username"));

    const ident = raw.toLowerCase();

    // Ищем по email или username (без изменения твоей сервисной структуры)
    let user = null;
    if (ident.includes("@")) {
      user = await authService.findUserByEmail(ident);
    } else if (typeof authService.findUserByUsername === "function") {
      user = await authService.findUserByUsername(ident);
    } else if (typeof authService.findUser === "function") {
      // Если есть универсальный метод
      user = await authService.findUser({ username: ident });
    }

    if (!user) return next(HttpException(404, "Пользователь не найден"));

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "15m" });

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const url = `${FRONTEND_URL}/reset-password-confirm?token=${token}`;
    if (process.env.NODE_ENV !== "production") {
      console.log("DEV reset URL:", url);
    }

    // Можно не возвращать сам токен в проде; для дев-режима удобно оставить
    return res.json({ message: "Reset link sent successfully.", resetToken: token });
  } catch (err) {
    return next(HttpException(err.status || 500, err.message || "Ошибка при запросе сброса пароля"));
  }
};

/**
 * POST /api/auth/reset-password
 * Принимает: { token, password } ИЛИ { token, newPassword }
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.body;
    const newPassword = req.body.newPassword ?? req.body.password;
    if (!token || !newPassword) return next(HttpException(400, "Некорректные данные"));

    await authService.resetPassword(token, newPassword);
    return res.json({ message: "Пароль успешно обновлён" });
  } catch (err) {
    return next(HttpException(err.status || 500, err.message || "Ошибка при сбросе пароля"));
  }
};

// ЯВНОЕ перечисление экспортов (чтобы ESM не путался)
export {
  register as _register,
  login as _login,
  getCurrent as _getCurrent,
  logout as _logout,
  requestPasswordReset as _requestPasswordReset,
  resetPassword as _resetPassword,
};
