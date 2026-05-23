import { Request, Response } from "express";

import * as auditLogService from "@/services/audit-log.service";
import { successResponse } from "@/utils/api-response";

export async function listRegistroAuditorias(req: Request, res: Response) {
  const data = await auditLogService.listRegistroAuditorias({
    accion: typeof req.query.accion === "string" ? req.query.accion : undefined,
    tipoEntidad: typeof req.query.tipoEntidad === "string" ? req.query.tipoEntidad : undefined,
    usuarioActorId: typeof req.query.usuarioActorId === "string" ? req.query.usuarioActorId : undefined,
    limit: typeof req.query.limit === "string" ? Number(req.query.limit) : undefined
  });

  return res.json(successResponse("Eventos de auditoría obtenidos correctamente.", data));
}
