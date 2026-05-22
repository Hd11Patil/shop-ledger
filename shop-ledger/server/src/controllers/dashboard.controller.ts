import type { Request, Response } from "express";
import * as service from "../services/dashboard.service.js";

export async function summary(_req: Request, res: Response) {
  res.json(await service.getSummary());
}

export async function expenseBreakdown(req: Request, res: Response) {
  res.json(await service.getExpenseBreakdown(req.query as { from?: string; to?: string }));
}

export async function insights(_req: Request, res: Response) {
  res.json(await service.getInsights());
}

export async function recentActivity(req: Request, res: Response) {
  const limit = Number(req.query.limit ?? 10);
  res.json(await service.getRecentActivity(Number.isFinite(limit) ? limit : 10));
}
