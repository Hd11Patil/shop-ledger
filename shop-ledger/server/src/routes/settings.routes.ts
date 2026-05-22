import { Router } from "express";
import * as controller from "../controllers/settings.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateSettingsSchema } from "../validations/settings.validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", catchAsync(controller.get));
router.patch("/", validate(updateSettingsSchema), catchAsync(controller.update));

export default router;
