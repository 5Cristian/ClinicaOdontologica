import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as authController from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { loginSchema, refreshSchema, registerSchema } from "@/validators/auth.validator";

const router = Router();
const isDevelopment = process.env.NODE_ENV !== "production";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    mensaje: "Demasiados intentos de inicio de sesión. Intente más tarde.",
    errors: []
  }
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 2000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    mensaje: "Demasiadas renovaciones de sesión. Intente más tarde.",
    errors: []
  }
});

router.post("/login", loginLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post("/refresh", refreshLimiter, validate(refreshSchema), asyncHandler(authController.refresh));
router.post("/logout", validate(refreshSchema), asyncHandler(authController.logout));
router.post(
  "/register",
  authenticate,
  authorize("ADMINISTRADOR"),
  validate(registerSchema),
  asyncHandler(authController.register)
);
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
