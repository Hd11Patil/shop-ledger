import { Router } from "express";
import * as controller from "../controllers/investment.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createInvestmentSchema,
  updateInvestmentSchema,
  listInvestmentsQuerySchema,
} from "../validations/investment.validation.js";
import { idParamSchema } from "../validations/category.validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", validate(listInvestmentsQuerySchema, "query"), catchAsync(controller.list));
router.post("/", validate(createInvestmentSchema), catchAsync(controller.create));
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateInvestmentSchema),
  catchAsync(controller.update),
);
router.delete("/:id", validate(idParamSchema, "params"), catchAsync(controller.remove));

export default router;
