import type { Request, Response } from "express";
import * as service from "../services/sale.service.js";

export async function list(req: Request, res: Response) {
  res.json(await service.listSales(req.query as { from?: string; to?: string }));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createSale(req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await service.updateSale(Number(req.params.id), req.body));
}

export async function remove(req: Request, res: Response) {
  await service.deleteSale(Number(req.params.id));
  res.status(204).end();
}
