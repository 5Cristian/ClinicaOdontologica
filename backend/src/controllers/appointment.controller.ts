import { Request, Response } from "express";
import { EstadoCita } from "@prisma/client";

import * as appointmentService from "@/services/appointment.service";
import { successResponse } from "@/utils/api-response";

export async function getCitas(_req: Request, res: Response) {
  const data = await appointmentService.listCitas();
  return res.json(successResponse("Citas obtenidas correctamente.", data));
}

export async function getCitaAvailability(req: Request, res: Response) {
  const date = String(req.query.date);
  const tratamientoId = typeof req.query.tratamientoId === "string" ? req.query.tratamientoId : undefined;
  const data = await appointmentService.obtenerHorariosDisponibles(date, tratamientoId);
  return res.json(successResponse("Disponibilidad obtenida correctamente.", data));
}

export async function createCita(req: Request, res: Response) {
  const data = await appointmentService.createCita(req.body, req.user?.id);
  return res.status(201).json(successResponse("Cita creada correctamente.", data));
}

export async function getCita(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = await appointmentService.getCitaById(id);
  return res.json(successResponse("Cita obtenida correctamente.", data));
}

export async function updateCita(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = await appointmentService.updateCita(id, req.body, req.user?.id);
  return res.json(successResponse("Cita actualizada correctamente.", data));
}

export async function updateEstadoCita(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = await appointmentService.updateEstadoCita(
    id,
    req.body.estado as EstadoCita,
    req.user?.id
  );
  return res.json(successResponse("Estado de la cita actualizado correctamente.", data));
}

export async function deleteCita(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await appointmentService.deleteCita(id, req.user?.id);
  return res.json(successResponse("Cita eliminada correctamente."));
}
