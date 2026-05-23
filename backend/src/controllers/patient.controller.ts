import { Request, Response } from "express";

import * as patientService from "@/services/patient.service";
import { successResponse } from "@/utils/api-response";

export async function getPacientes(_req: Request, res: Response) {
  const data = await patientService.listPacientes();
  return res.json(successResponse("Pacientes obtenidos correctamente.", data));
}

export async function createPaciente(req: Request, res: Response) {
  const data = await patientService.createPaciente(req.body, req.user?.id);
  return res.status(201).json(successResponse("Paciente creado correctamente.", data));
}

export async function getPaciente(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = await patientService.getPacienteById(id);
  return res.json(successResponse("Paciente obtenido correctamente.", data));
}

export async function updatePaciente(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = await patientService.updatePaciente(id, req.body, req.user?.id);
  return res.json(successResponse("Paciente actualizado correctamente.", data));
}

export async function deletePaciente(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await patientService.deletePaciente(id, req.user?.id);
  return res.json(successResponse("Paciente eliminado correctamente."));
}
