import { Router } from "express";
import * as controller from "../controllers/category.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
} from "../validations/category.validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", catchAsync(controller.list));
router.post("/", validate(createCategorySchema), catchAsync(controller.create));
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  catchAsync(controller.update),
);
router.delete("/:id", validate(idParamSchema, "params"), catchAsync(controller.remove));

export default router;
