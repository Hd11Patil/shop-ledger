import type { Request, Response } from "express";
import * as service from "../services/report.service.js";
import type { PeriodReportQuery } from "../validations/settings.validation.js";

export async function period(req: Request, res: Response) {
  res.json(await service.getPeriodReport(req.query as unknown as PeriodReportQuery));
}
