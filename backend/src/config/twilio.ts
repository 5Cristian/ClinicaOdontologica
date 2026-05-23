import twilio from "twilio";

import { env } from "@/config/env";

// Crea el cliente Twilio solo cuando la integración está configurada.
export function getTwilioClient() {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    return null;
  }

  return twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

export function getTwilioWhatsappFrom() {
  return env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";
}
