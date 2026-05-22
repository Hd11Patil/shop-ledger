import type { Request, Response } from "express";
import * as service from "../services/category.service.js";

export async function list(_req: Request, res: Response) {
  res.json(await service.listCategories());
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await service.createCategory(req.body));
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  res.json(await service.updateCategory(id, req.body));
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await service.deleteCategory(id);
  res.status(204).end();
}
