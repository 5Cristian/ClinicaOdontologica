import { Request, Response } from "express";

import * as clinicalRecordService from "@/services/clinical-record.service";
import { successResponse } from "@/utils/api-response";

export async function getRegistroClinicos(req: Request, res: Response) {
  const pacienteId = typeof req.query.pacienteId === "string" ? req.query.pacienteId : undefined;
  const data = await clinicalRecordService.listRegistroClinicos(pacienteId);
  return res.json(successResponse("Historial clínico obtenido correctamente.", data));
}

export async function createRegistroClinico(req: Request, res: Response) {
  const data = await clinicalRecordService.createRegistroClinico(req.body, req.user?.id);
  return res.status(201).json(successResponse("Registro clínico creado correctamente.", data));
}

export async function getRegistroClinico(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = await clinicalRecordService.getRegistroClinicoById(id);
  return res.json(successResponse("Registro clínico obtenido correctamente.", data));
}

export async function updateRegistroClinico(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = await clinicalRecordService.updateRegistroClinico(id, req.body, req.user?.id);
  return res.json(successResponse("Registro clínico actualizado correctamente.", data));
}

export async function deleteRegistroClinico(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await clinicalRecordService.deleteRegistroClinico(id, req.user?.id);
  return res.json(successResponse("Registro clínico eliminado correctamente."));
}
