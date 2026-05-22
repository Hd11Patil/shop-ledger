import { Router } from "express";
import * as controller from "../controllers/report.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { periodReportQuerySchema } from "../validations/settings.validation.js";

const router = Router();
router.use(requireAuth);

router.get("/period", validate(periodReportQuerySchema, "query"), catchAsync(controller.period));

export default router;
