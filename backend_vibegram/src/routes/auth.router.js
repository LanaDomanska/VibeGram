import { Router } from "express";
import {
  register,
  login,
  getCurrent,
  logout,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authorization.js";
import { validateBody } from "../middlewares/validateBody.js";
import { loginSchema, registerSchema } from "../validation/auth.schema.js";

const authRouter = Router();

authRouter.post("/register",      validateBody(registerSchema), register);
authRouter.post("/login",         validateBody(loginSchema),    login);
authRouter.post("/logout",        logout);
authRouter.get("/current",        authenticate,                 getCurrent);
authRouter.post("/reset-request", requestPasswordReset);
authRouter.post("/reset-password",resetPassword);

export default authRouter;
