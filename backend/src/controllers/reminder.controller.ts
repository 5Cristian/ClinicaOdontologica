import { Request, Response } from "express";

import * as reminderService from "@/services/reminder.service";
import { successResponse } from "@/utils/api-response";

export async function getProviderStatus(_req: Request, res: Response) {
  const data = await reminderService.getRecordatorioProviderStatus();
  return res.json(successResponse("Estado del proveedor obtenido correctamente.", data));
}

export async function getPendingRecordatorios(_req: Request, res: Response) {
  const data = await reminderService.listPendingRecordatorios();
  return res.json(successResponse("Recordatorios pendientes obtenidos correctamente.", data));
}

export async function getRescheduleRequests(_req: Request, res: Response) {
  const data = await reminderService.listRescheduleRequests();
  return res.json(successResponse("Solicitudes de reprogramación obtenidas correctamente.", data));
}

export async function getCitaConversation(req: Request, res: Response) {
  const { citaId } = req.params as { citaId: string };
  const data = await reminderService.getCitaConversation(citaId);
  return res.json(successResponse("Conversación de WhatsApp obtenida correctamente.", data));
}

export async function sendWhatsappRecordatorio(req: Request, res: Response) {
  const { citaId } = req.params as { citaId: string };
  const customMessage =
    typeof req.body?.mensaje === "string" && req.body.mensaje.trim().length
      ? req.body.mensaje
      : undefined;
  const data = await reminderService.createWhatsappRecordatorio(citaId, req.user?.id, customMessage);
  return res.json(successResponse("Recordatorio generado correctamente.", data));
}

export async function enviarRespuestaManual(req: Request, res: Response) {
  const { citaId } = req.params as { citaId: string };
  const mensaje = String(req.body?.mensaje ?? "");
  const data = await reminderService.sendManualWhatsappReply(citaId, mensaje, req.user?.id);
  return res.json(successResponse("Respuesta enviada correctamente.", data));
}

export async function handleTwilioStatusWebhook(req: Request, res: Response) {
  await reminderService.updateRecordatorioDeliveryStatus({
    mensajeSid: String(req.body.MessageSid ?? ""),
    mensajeStatus: typeof req.body.MessageStatus === "string" ? req.body.MessageStatus : undefined,
    errorCode: typeof req.body.ErrorCode === "string" ? req.body.ErrorCode : undefined,
    errorMessage: typeof req.body.ErrorMessage === "string" ? req.body.ErrorMessage : undefined
  });

  return res.status(200).send("ok");
}

export async function handleTwilioInboundWebhook(req: Request, res: Response) {
  const data = await reminderService.handleIncomingWhatsappMessage({
    from: String(req.body.From ?? ""),
    body: String(req.body.Body ?? "")
  });

  res.set("Content-Type", "text/xml");
  return res.status(200).send(data.twiml);
}
