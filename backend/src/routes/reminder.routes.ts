import { Router } from "express";
import { z } from "zod";

import * as reminderController from "@/controllers/reminder.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";

const reminderParamSchema = z.object({
  params: z.object({
    citaId: z.string().cuid()
  })
});

const reminderBodySchema = z.object({
  body: z.object({
    mensaje: z.string().min(10).max(500).optional()
  }),
  params: z.object({
    citaId: z.string().cuid()
  })
});

const manualReplyBodySchema = z.object({
  body: z.object({
    mensaje: z.string().trim().min(5).max(1000)
  }),
  params: z.object({
    citaId: z.string().cuid()
  })
});

const router = Router();

router.get(
  "/proveedor-status",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION"),
  asyncHandler(reminderController.getProviderStatus)
);
router.get(
  "/whatsapp-web/status",
  authenticate,
  authorize("ADMINISTRADOR"),
  asyncHandler(reminderController.getWhatsappWebConnectionStatus)
);
router.post(
  "/whatsapp-web/start",
  authenticate,
  authorize("ADMINISTRADOR"),
  asyncHandler(reminderController.startWhatsappWebConnection)
);
router.post(
  "/whatsapp-web/disconnect",
  authenticate,
  authorize("ADMINISTRADOR"),
  asyncHandler(reminderController.disconnectWhatsappWebConnection)
);
router.post(
  "/process-one-day",
  authenticate,
  authorize("ADMINISTRADOR"),
  asyncHandler(reminderController.processOneDayReminders)
);
router.get(
  "/pending",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION"),
  asyncHandler(reminderController.getPendingRecordatorios)
);
router.get(
  "/reschedule-requests",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION"),
  asyncHandler(reminderController.getRescheduleRequests)
);
router.get(
  "/conversation/:citaId",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION", "ODONTOLOGO"),
  validate(reminderParamSchema),
  asyncHandler(reminderController.getCitaConversation)
);
router.post(
  "/whatsapp/:citaId",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION"),
  validate(reminderBodySchema),
  asyncHandler(reminderController.sendWhatsappRecordatorio)
);
router.post(
  "/reply/:citaId",
  authenticate,
  authorize("ADMINISTRADOR", "RECEPCION"),
  validate(manualReplyBodySchema),
  asyncHandler(reminderController.enviarRespuestaManual)
);

export default router;
