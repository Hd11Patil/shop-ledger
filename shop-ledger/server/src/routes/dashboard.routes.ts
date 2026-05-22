import { Router } from "express";
import * as controller from "../controllers/dashboard.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { breakdownQuerySchema } from "../validations/settings.validation.js";

const router = Router();
router.use(requireAuth);

router.get("/summary", catchAsync(controller.summary));
router.get(
  "/expense-breakdown",
  validate(breakdownQuerySchema, "query"),
  catchAsync(controller.expenseBreakdown),
);
router.get("/insights", catchAsync(controller.insights));
router.get("/recent-activity", catchAsync(controller.recentActivity));

export default router;
