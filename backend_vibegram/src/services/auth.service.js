import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import HttpException from "../utils/HttpException.js";

const { JWT_SECRET } = process.env;

const createToken = (user) => {
  const payload = { id: user._id };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const register = async ({ email, username, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw HttpException(409, `User with email=${email} already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, username, password: hashedPassword });
  await newUser.save();

  const token = createToken(newUser);
  newUser.token = token;
  await newUser.save();

  return {
    token,
    user: {
      email: newUser.email,
      username: newUser.username,
    },
  };
};

export const login = async ({ usernameOrEmail, password }) => {
  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  });

  if (!user) throw HttpException(401, "Пользователь не найден");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw HttpException(401, "Неверный пароль");

  const token = createToken(user);
  user.token = token;
  await user.save();

  return {
    token,
    user: {
      email: user.email,
      username: user.username,
    },
  };
};

export const getCurrent = async (user) => {
  const token = createToken(user);
  user.token = token;
  await user.save();

  return {
    token,
    user: {
      email: user.email,
      username: user.username,
    },
  };
};

export const logout = async ({ _id }) => {
  const user = await User.findById(_id);
  if (!user) throw HttpException(401, "User not found");
  user.token = "";
  await user.save();
};

export const resetPassword = async (token, newPassword) => {
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw HttpException(400, "Неверный или просроченный токен");
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  const user = await User.findByIdAndUpdate(payload.id, { password: hashed });

  if (!user) throw HttpException(404, "Пользователь не найден");
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};
