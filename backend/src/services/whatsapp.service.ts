import path from "node:path";

import QRCode from "qrcode";
import { Client, LocalAuth, Message } from "whatsapp-web.js";

import { env } from "@/config/env";
import { AppError } from "@/utils/app-error";

type WhatsappWebState = "disabled" | "disconnected" | "initializing" | "qr" | "ready" | "auth_failure";

let client: Client | null = null;
let state: WhatsappWebState = "disconnected";
let latestQr: string | null = null;
let latestQrDataUrl: string | null = null;
let lastError: string | null = null;
let initializing = false;
let initializePromise: Promise<void> | null = null;

function buildPuppeteerOptions() {
  const executablePath = env.WHATSAPP_WEB_CHROME_PATH?.trim() || undefined;

  return {
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  };
}

function ensureProviderEnabled() {
  if (env.WHATSAPP_PROVIDER !== "WHATSAPP_WEB") {
    throw new AppError("WhatsApp Web no esta habilitado como proveedor.", 400);
  }
}

function normalizePhoneForWhatsapp(rawPhone: string) {
  const digits = rawPhone.replace(/[^\d]/g, "");
  if (digits.length < 8) {
    throw new AppError("Numero de WhatsApp invalido.", 400);
  }

  if (digits.startsWith(env.WHATSAPP_DEFAULT_COUNTRY_CODE)) {
    return digits;
  }

  return `${env.WHATSAPP_DEFAULT_COUNTRY_CODE}${digits}`;
}

export function getWhatsappWebStatus() {
  return {
    providerEnabled: env.WHATSAPP_PROVIDER === "WHATSAPP_WEB",
    autoStart: env.WHATSAPP_WEB_AUTO_START === "true",
    state: env.WHATSAPP_PROVIDER === "WHATSAPP_WEB" ? state : "disabled",
    ready: state === "ready",
    hasQr: Boolean(latestQrDataUrl),
    qr: latestQr,
    qrDataUrl: latestQrDataUrl,
    lastError,
    sessionPath: env.WHATSAPP_WEB_SESSION_PATH
  };
}

export async function initializeWhatsappWebClient() {
  ensureProviderEnabled();

  if (client && state === "ready") {
    return getWhatsappWebStatus();
  }

  if (initializing || initializePromise) {
    return getWhatsappWebStatus();
  }

  initializing = true;
  state = "initializing";
  lastError = null;

  const sessionPath = path.resolve(process.cwd(), env.WHATSAPP_WEB_SESSION_PATH);
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: "clinica-odontologica",
      dataPath: sessionPath
    }),
    puppeteer: buildPuppeteerOptions()
  });

  client.on("qr", (qr) => {
    latestQr = qr;
    state = "qr";
    QRCode.toDataURL(qr)
      .then((dataUrl) => {
        latestQrDataUrl = dataUrl;
      })
      .catch((error: unknown) => {
        lastError = error instanceof Error ? error.message : "No se pudo generar el QR.";
      });
  });

  client.on("ready", () => {
    state = "ready";
    initializing = false;
    initializePromise = null;
    latestQr = null;
    latestQrDataUrl = null;
    lastError = null;
  });

  client.on("authenticated", () => {
    lastError = null;
  });

  client.on("auth_failure", (message) => {
    state = "auth_failure";
    initializing = false;
    initializePromise = null;
    lastError = message;
  });

  client.on("disconnected", (reason) => {
    state = "disconnected";
    lastError = reason;
    client = null;
    initializing = false;
  });

  initializePromise = client
    .initialize()
    .then(() => {
      initializing = false;
      initializePromise = null;
    })
    .catch((error: unknown) => {
      state = "disconnected";
      client = null;
      initializing = false;
      initializePromise = null;
      lastError = error instanceof Error ? error.message : "No se pudo iniciar WhatsApp Web.";
      console.error(`No se pudo iniciar WhatsApp Web: ${lastError}`);
    });

  return getWhatsappWebStatus();
}

export async function disconnectWhatsappWebClient() {
  if (!client) {
    state = "disconnected";
    latestQr = null;
    latestQrDataUrl = null;
    return getWhatsappWebStatus();
  }

  await client.destroy();
  client = null;
  initializePromise = null;
  initializing = false;
  state = "disconnected";
  latestQr = null;
  latestQrDataUrl = null;
  return getWhatsappWebStatus();
}

export async function sendWhatsappWebMessage(phone: string, message: string) {
  ensureProviderEnabled();

  if (!client || state !== "ready") {
    throw new AppError("WhatsApp Web no esta conectado. Escanee el QR desde configuracion.", 503);
  }

  const normalizedPhone = normalizePhoneForWhatsapp(phone);
  const numberId = await client.getNumberId(normalizedPhone);

  if (!numberId) {
    throw new AppError(
      `El numero ${normalizedPhone} no esta registrado en WhatsApp o no puede resolverse desde WhatsApp Web.`,
      422
    );
  }

  const chatId = numberId._serialized;
  const sentMessage = (await client.sendMessage(chatId, message)) as Message;

  return {
    providerMessageId: sentMessage.id?._serialized ?? null,
    status: "sent"
  };
}

export async function initializeWhatsappWebIfConfigured() {
  if (env.WHATSAPP_PROVIDER !== "WHATSAPP_WEB" || env.WHATSAPP_WEB_AUTO_START !== "true") {
    return;
  }

  try {
    await initializeWhatsappWebClient();
  } catch (error) {
    console.error(error);
  }
}
