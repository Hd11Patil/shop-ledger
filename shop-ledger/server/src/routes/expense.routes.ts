import { Router } from "express";
import * as controller from "../controllers/expense.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
} from "../validations/expense.validation.js";
import { idParamSchema } from "../validations/category.validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", validate(listExpensesQuerySchema, "query"), catchAsync(controller.list));
router.post("/", validate(createExpenseSchema), catchAsync(controller.create));
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateExpenseSchema),
  catchAsync(controller.update),
);
router.delete("/:id", validate(idParamSchema, "params"), catchAsync(controller.remove));

export default router;
