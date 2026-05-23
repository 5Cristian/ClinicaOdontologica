import { Router } from "express";
import { z } from "zod";

import * as auditLogController from "@/controllers/audit-log.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";

const auditLogQuerySchema = z.object({
  query: z.object({
    accion: z.string().trim().min(1).optional(),
    tipoEntidad: z.string().trim().min(1).optional(),
    usuarioActorId: z.string().cuid().optional(),
    limit: z.coerce.number().int().min(1).max(500).optional()
  })
});

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMINISTRADOR"),
  validate(auditLogQuerySchema),
  asyncHandler(auditLogController.listRegistroAuditorias)
);

export default router;
