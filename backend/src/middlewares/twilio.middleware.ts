import { NextFunction, Request, Response } from "express";
import twilio from "twilio";

import { env } from "@/config/env";
import { AppError } from "@/utils/app-error";

export function validateTwilioWebhook(req: Request, _res: Response, next: NextFunction) {
  if (env.WHATSAPP_PROVIDER !== "TWILIO") {
    return next();
  }

  if (!env.TWILIO_AUTH_TOKEN) {
    return next(new AppError("Twilio no está configurado correctamente.", 500));
  }

  const signature = req.header("X-Twilio-Signature");
  if (!signature) {
    return next(new AppError("Firma de Twilio ausente.", 403));
  }

  const url = `${env.APP_BASE_URL}${req.originalUrl}`;
  const isValid = twilio.validateRequest(env.TWILIO_AUTH_TOKEN, signature, url, req.body);

  if (!isValid) {
    return next(new AppError("Webhook de Twilio inválido.", 403));
  }

  return next();
}
