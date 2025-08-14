import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getCurrentUser
} from "../controllers/users.controller.js";

import { authenticate } from "../middlewares/authorization.js";
import { validateBody } from "../middlewares/validateBody.js";
import { userUpdateSchema } from "../validation/users.schema.js";
import uploadAvatar from "../middlewares/uploadAvatar.js";
import { uploadAvatar as uploadAvatarController } from "../controllers/users.controller.js";
import { searchUsers } from "../controllers/users.controller.js";



const usersRouter = Router();

// Текущий пользователь
usersRouter.get("/me", authenticate, getCurrentUser);

// Обновление своего профиля
usersRouter.put("/", authenticate, validateBody(userUpdateSchema), updateUserProfile);

// Удаление (себя или если админ)
usersRouter.delete("/:id", authenticate, deleteUser);

// Просмотр чужого профиля
usersRouter.get("/:username", authenticate, getUserProfile);
usersRouter.post(
  "/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  uploadAvatarController
);
usersRouter.get("/search", authenticate, searchUsers);

export default usersRouter;
