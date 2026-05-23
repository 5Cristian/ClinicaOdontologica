import { Request, Response } from "express";

import * as treatmentService from "@/services/treatment.service";
import { successResponse } from "@/utils/api-response";

export async function getTratamientos(_req: Request, res: Response) {
  const data = await treatmentService.listTratamientos();
  return res.json(successResponse("Tratamientos obtenidos correctamente.", data));
}

export async function createTratamiento(req: Request, res: Response) {
  const data = await treatmentService.createTratamiento(req.body, req.user?.id);
  return res.status(201).json(successResponse("Tratamiento creado correctamente.", data));
}

export async function updateTratamiento(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = await treatmentService.updateTratamiento(id, req.body, req.user?.id);
  return res.json(successResponse("Tratamiento actualizado correctamente.", data));
}

export async function deleteTratamiento(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await treatmentService.deleteTratamiento(id, req.user?.id);
  return res.json(successResponse("Tratamiento eliminado correctamente."));
}
