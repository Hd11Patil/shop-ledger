import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as controller from "../controllers/auth.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), catchAsync(controller.register));
router.post("/login", authLimiter, validate(loginSchema), catchAsync(controller.login));
router.get("/me", requireAuth, catchAsync(controller.me));
router.post("/logout", requireAuth, controller.logout);

export default router;
