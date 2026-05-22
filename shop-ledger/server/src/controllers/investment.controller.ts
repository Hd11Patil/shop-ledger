import type { Request, Response } from "express";
import * as service from "../services/investment.service.js";

export async function list(req: Request, res: Response) {
  res.json(await service.listInvestments(req.query as { from?: string; to?: string }));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createInvestment(req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await service.updateInvestment(Number(req.params.id), req.body));
}

export async function remove(req: Request, res: Response) {
  await service.deleteInvestment(Number(req.params.id));
  res.status(204).end();
}
