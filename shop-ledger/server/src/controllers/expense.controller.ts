import type { Request, Response } from "express";
import * as service from "../services/expense.service.js";

export async function list(req: Request, res: Response) {
  res.json(
    await service.listExpenses(req.query as { categoryId?: number; from?: string; to?: string }),
  );
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createExpense(req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await service.updateExpense(Number(req.params.id), req.body));
}

export async function remove(req: Request, res: Response) {
  await service.deleteExpense(Number(req.params.id));
  res.status(204).end();
}
