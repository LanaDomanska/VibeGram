import * as usersService from "../services/users.service.js";
import HttpException from "../utils/HttpException.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  const user = await usersService.getUserByUsername(username);
  if (!user) throw HttpException(404, `User @${username} not found`);
  res.json(user);
};

export const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const updated = await usersService.updateUserProfile(userId, req.body);
  res.json(updated);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.id !== id && req.user.role !== "admin" && req.user.role !== "superadmin") {
    throw HttpException(403, "You can only delete your own account");
  }

  await usersService.deleteUser(id);
  res.json({ message: `User ${id} deleted` });
};

export const getCurrentUser = async (req, res) => {
  const user = await usersService.getUserById(req.user.id);
  res.json(user);
};
export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpException(400, "Файл не загружен");
  }

  const userId = req.user.id;
  const avatarPath = `/public/avatars/${req.file.filename}`;

  const updatedUser = await usersService.updateUserProfile(userId, {
    avatar: avatarPath,
  });

  res.json({
    message: "Аватар обновлён",
    avatar: avatarPath,
    user: updatedUser,
  });
};
export const searchUsers = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ message: "Пустой запрос" });

  const regex = new RegExp(query, "i"); 

  const users = await usersService.searchUsers(regex);
  res.json(users);
};
