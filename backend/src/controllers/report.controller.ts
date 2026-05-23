import { Request, Response } from "express";

import * as reportService from "@/services/report.service";
import { successResponse } from "@/utils/api-response";

export async function getSummary(_req: Request, res: Response) {
  const data = await reportService.getReportSummary();
  return res.json(successResponse("Reportes obtenidos correctamente.", data));
}
