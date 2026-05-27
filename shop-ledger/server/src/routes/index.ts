import { Router } from "express";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import saleRoutes from "./sale.routes.js";
import expenseRoutes from "./expense.routes.js";
import investmentRoutes from "./investment.routes.js";
import settingsRoutes from "./settings.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import reportRoutes from "./report.routes.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "shop-ledger-api",
    message: "API is running",
    health: "/api/healthz",
  });
});

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/sales", saleRoutes);
router.use("/expenses", expenseRoutes);
router.use("/investments", investmentRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);

export default router;
