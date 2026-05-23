import { Request, Response } from "express";

import * as clinicConfigService from "@/services/clinic-config.service";
import { successResponse } from "@/utils/api-response";

export async function getConfiguracionClinica(_req: Request, res: Response) {
  const data = await clinicConfigService.getConfiguracionClinica();
  return res.json(successResponse("Configuración obtenida correctamente.", data));
}

export async function upsertConfiguracionClinica(req: Request, res: Response) {
  const data = await clinicConfigService.upsertConfiguracionClinica(req.body, req.user?.id);
  return res.json(successResponse("Configuración actualizada correctamente.", data));
}
