import twilio from "twilio";
import { EstadoCita } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { prisma } from "@/config/prisma";
import { env } from "@/config/env";
import { getTwilioClient, getTwilioWhatsappFrom } from "@/config/twilio";
import { AppError } from "@/utils/app-error";

type PacienteIntent = "CONFIRMADA" | "CANCEL_REQUESTED" | "RESCHEDULE_REQUESTED" | "UNKNOWN";

function buildRecordatorioMessage(input: {
  patientName: string;
  nombreClinica: string;
  programadaPara: Date;
  template?: string | null;
}) {
  const iso = input.programadaPara.toISOString();
  const dateLabel = iso.slice(0, 10);
  const timeLabel = iso.slice(11, 16);

  return (
    input.template
      ?.replace("[Nombre]", input.patientName)
      .replace("[Nombre de la Clínica]", input.nombreClinica)
      .replace("[Fecha]", dateLabel)
      .replace("[Hora]", timeLabel) ??
    `Hola ${input.patientName}, le recordamos su cita odontológica en ${input.nombreClinica} el día ${dateLabel} a las ${timeLabel}. Responda CONFIRMO, CANCELAR o REPROGRAMAR.`
  );
}

function detectPacienteIntent(body: string): PacienteIntent {
  const normalized = body
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

  if (normalized.includes("CONFIRMO") || normalized.includes("CONFIRMAR") || normalized === "SI") {
    return "CONFIRMADA";
  }

  if (normalized.includes("CANCEL")) {
    return "CANCEL_REQUESTED";
  }

  if (normalized.includes("REPROGRAM") || normalized.includes("CAMBIAR") || normalized.includes("MOVER")) {
    return "RESCHEDULE_REQUESTED";
  }

  return "UNKNOWN";
}

function buildInboundReply(intent: PacienteIntent) {
  const response = new twilio.twiml.MessagingResponse();

  // Responde al paciente según la intención detectada en el mensaje.
  if (intent === "CONFIRMADA") {
    response.message("Gracias. Su cita ha sido confirmada correctamente.");
    return response.toString();
  }

  if (intent === "CANCEL_REQUESTED") {
    response.message("Hemos registrado su solicitud de cancelación. La clínica confirmará la actualización.");
    return response.toString();
  }

  if (intent === "RESCHEDULE_REQUESTED") {
    response.message("Hemos registrado su solicitud de reprogramación. El equipo se comunicará con usted.");
    return response.toString();
  }

  response.message("Respuesta recibida. Por favor escriba CONFIRMO, CANCELAR o REPROGRAMAR.");
  return response.toString();
}

export async function listPendingRecordatorios() {
  // Muestra citas futuras sin recordatorio enviado para trabajo operativo de recepción.
  return prisma.cita.findMany({
    where: {
      programadaPara: {
        gte: new Date()
      },
      estado: {
        in: ["PENDIENTE", "CONFIRMADA"]
      },
      recordatorioEnviado: false
    },
    include: {
      paciente: true,
      tratamiento: true,
      recordatorio: true
    },
    orderBy: { programadaPara: "asc" }
  });
}

export async function listRescheduleRequests() {
  // Reúne las citas donde el paciente pidió reprogramación por WhatsApp.
  return prisma.cita.findMany({
    where: {
      recordatorio: {
        intencionRespuestaPaciente: "RESCHEDULE_REQUESTED"
      }
    },
    include: {
      paciente: true,
      tratamiento: true,
      recordatorio: true
    },
    orderBy: { programadaPara: "asc" }
  });
}

export async function getRecordatorioProviderStatus() {
  const twilioConfigured = Boolean(
    env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM
  );

  return {
    proveedor: env.WHATSAPP_PROVIDER,
    twilioConfigured,
    mode: env.WHATSAPP_PROVIDER === "TWILIO" && twilioConfigured ? "REAL" : "FALLBACK_MANUAL"
  };
}

async function appendConversationMessage(input: {
  citaId: string;
  direction: "OUTBOUND" | "INBOUND";
  cuerpoMensaje: string;
  proveedor?: string | null;
  sidMensajeProveedor?: string | null;
  estadoEntrega?: string | null;
  intencionDetectada?: string | null;
  enviadoPorUsuarioId?: string | null;
}) {
  // Guarda cada mensaje para reconstruir la conversación completa por cita.
  await prisma.mensajeConversacionWhatsApp.create({
    data: {
      id: randomUUID(),
      citaId: input.citaId,
      direccion: input.direction,
      cuerpoMensaje: input.cuerpoMensaje,
      proveedor: input.proveedor ?? null,
      sidMensajeProveedor: input.sidMensajeProveedor ?? null,
      estadoEntrega: input.estadoEntrega ?? null,
      intencionDetectada: input.intencionDetectada ?? null,
      enviadoPorUsuarioId: input.enviadoPorUsuarioId ?? null
    }
  });
}

async function sendWhatsappMessage(telefono: string, mensaje: string) {
  const proveedorStatus = await getRecordatorioProviderStatus();
  let proveedor = "MANUAL";
  let sidMensajeProveedor: string | null = null;
  let estadoEntrega = "queued-manual";

  if (proveedorStatus.mode === "REAL") {
    const client = getTwilioClient();

    if (!client) {
      throw new AppError("Twilio no está configurado correctamente.", 500);
    }

    // Usa Twilio cuando el proveedor real está disponible.
    const twilioMessage = await client.messages.create({
      from: getTwilioWhatsappFrom(),
      to: `whatsapp:+${telefono}`,
      body: mensaje,
      statusCallback: `${env.APP_BASE_URL}/api/webhooks/twilio/whatsapp/status`
    });

    proveedor = "TWILIO";
    sidMensajeProveedor = twilioMessage.sid;
    estadoEntrega = twilioMessage.status ?? "queued";
  }

  return {
    proveedorStatus,
    proveedor,
    sidMensajeProveedor,
    estadoEntrega,
    whatsappLink: `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
  };
}

export async function getCitaConversation(citaId: string) {
  const appointment = await prisma.cita.findUnique({
    where: { id: citaId }
  });

  if (!appointment) {
    throw new AppError("Cita no encontrada.", 404);
  }

  const messages = await prisma.mensajeConversacionWhatsApp.findMany({
    where: { citaId },
    orderBy: { creadoEn: "asc" }
  });

  return messages.map((message) => ({
    id: message.id,
    citaId: message.citaId,
    direction: message.direccion,
    cuerpoMensaje: message.cuerpoMensaje,
    proveedor: message.proveedor,
    sidMensajeProveedor: message.sidMensajeProveedor,
    estadoEntrega: message.estadoEntrega,
    intencionDetectada: message.intencionDetectada,
    enviadoPorUsuarioId: message.enviadoPorUsuarioId,
    creadoEn: message.creadoEn
  }));
}

export async function createWhatsappRecordatorio(
  citaId: string,
  usuarioId?: string,
  customMessage?: string
) {
  const appointment = await prisma.cita.findUnique({
    where: { id: citaId },
    include: {
      paciente: true,
      tratamiento: true
    }
  });

  if (!appointment) {
    throw new AppError("Cita no encontrada.", 404);
  }

  const config = await prisma.configuracionClinica.findFirst();
  const nombreClinica = config?.nombreClinica ?? "Clínica Dental";
  const telefono = appointment.paciente.whatsapp.replace(/[^\d]/g, "");
  const mensaje = buildRecordatorioMessage({
    patientName: appointment.paciente.nombreCompleto,
    nombreClinica,
    programadaPara: appointment.programadaPara,
    template: customMessage || config?.mensajeWhatsappPredeterminado
  });

  const proveedorSend = await sendWhatsappMessage(telefono, mensaje);
  let proveedor = proveedorSend.proveedor;
  let sidMensajeProveedor: string | null = proveedorSend.sidMensajeProveedor;
  let estadoEntrega = proveedorSend.estadoEntrega;
  let ultimoError: string | null = null;

  const reminder = await prisma.recordatorio.upsert({
    where: { citaId },
    update: {
      mensaje,
      proveedor,
      sidMensajeProveedor,
      estadoEntrega,
      ultimoError,
      enviadoEn: new Date()
    },
    create: {
      citaId,
      mensaje,
      canal: proveedor === "TWILIO" ? "WHATSAPP_TWILIO" : "WHATSAPP_MANUAL",
      proveedor,
      sidMensajeProveedor,
      estadoEntrega,
      ultimoError,
      enviadoEn: new Date()
    }
  });

  await prisma.cita.update({
    where: { id: citaId },
    data: {
      recordatorioEnviado: true,
      recordatorioEnviadoEn: new Date(),
      actualizadoPor: usuarioId
    }
  });

  await appendConversationMessage({
    citaId,
    direction: "OUTBOUND",
    cuerpoMensaje: mensaje,
    proveedor,
    sidMensajeProveedor,
    estadoEntrega,
    enviadoPorUsuarioId: usuarioId
  });

  return {
    reminder,
    proveedorMode: proveedorSend.proveedorStatus.mode,
    whatsappLink: proveedorSend.whatsappLink
  };
}

export async function sendManualWhatsappReply(
  citaId: string,
  rawMessage: string,
  usuarioId?: string
) {
  const mensaje = rawMessage.trim();
  if (!mensaje) {
    throw new AppError("El mensaje de respuesta no puede estar vacío.", 400);
  }

  const appointment = await prisma.cita.findUnique({
    where: { id: citaId },
    include: {
      paciente: true,
      recordatorio: true
    }
  });

  if (!appointment) {
    throw new AppError("Cita no encontrada.", 404);
  }

  const telefono = appointment.paciente.whatsapp.replace(/[^\d]/g, "");
  const proveedorSend = await sendWhatsappMessage(telefono, mensaje);

  // Guarda la última respuesta manual para seguimiento desde recepción.
  const reminder = await prisma.recordatorio.upsert({
    where: { citaId },
    update: {
      proveedor: proveedorSend.proveedor,
      sidMensajeProveedor: proveedorSend.sidMensajeProveedor,
      estadoEntrega: proveedorSend.estadoEntrega,
      ultimaRespuestaManual: mensaje,
      ultimaRespuestaManualEn: new Date(),
      ultimoError: null
    },
    create: {
      citaId,
      mensaje,
      canal: proveedorSend.proveedor === "TWILIO" ? "WHATSAPP_TWILIO" : "WHATSAPP_MANUAL",
      proveedor: proveedorSend.proveedor,
      sidMensajeProveedor: proveedorSend.sidMensajeProveedor,
      estadoEntrega: proveedorSend.estadoEntrega,
      ultimaRespuestaManual: mensaje,
      ultimaRespuestaManualEn: new Date()
    }
  });

  await prisma.cita.update({
    where: { id: citaId },
    data: {
      actualizadoPor: usuarioId
    }
  });

  await appendConversationMessage({
    citaId,
    direction: "OUTBOUND",
    cuerpoMensaje: mensaje,
    proveedor: proveedorSend.proveedor,
    sidMensajeProveedor: proveedorSend.sidMensajeProveedor,
    estadoEntrega: proveedorSend.estadoEntrega,
    enviadoPorUsuarioId: usuarioId
  });

  return {
    reminder,
    proveedorMode: proveedorSend.proveedorStatus.mode,
    whatsappLink: proveedorSend.whatsappLink
  };
}

export async function updateRecordatorioDeliveryStatus(input: {
  mensajeSid: string;
  mensajeStatus?: string;
  errorCode?: string;
  errorMessage?: string;
}) {
  // Sincroniza el estado que Twilio informa por webhook.
  return prisma.recordatorio.updateMany({
    where: {
      sidMensajeProveedor: input.mensajeSid
    },
    data: {
      estadoEntrega: input.mensajeStatus ?? undefined,
      ultimoError: input.errorMessage || input.errorCode || null
    }
  });
}

export async function handleIncomingWhatsappMessage(input: { from: string; body: string }) {
  const normalizedPhone = input.from.replace(/[^\d]/g, "").replace(/^whatsapp:/, "");
  const intent = detectPacienteIntent(input.body);

  // Busca la cita futura más cercana asociada al número del paciente.
  const appointment = await prisma.cita.findFirst({
    where: {
      paciente: {
        OR: [{ whatsapp: { contains: normalizedPhone.slice(-8) } }, { telefono: { contains: normalizedPhone.slice(-8) } }]
      },
      estado: {
        in: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA]
      },
      programadaPara: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    },
    include: {
      recordatorio: true,
      paciente: true
    },
    orderBy: { programadaPara: "asc" }
  });

  if (!appointment || !appointment.recordatorio) {
    return {
      twiml: buildInboundReply("UNKNOWN"),
      matched: false
    };
  }

  let nextStatus = appointment.estado;
  let noteSuffix = "";

  if (intent === "CONFIRMADA") {
    nextStatus = EstadoCita.CONFIRMADA;
  } else if (intent === "CANCEL_REQUESTED") {
    nextStatus = EstadoCita.CANCELADA;
    noteSuffix = "Solicitud de cancelación recibida por WhatsApp.";
  } else if (intent === "RESCHEDULE_REQUESTED") {
    nextStatus = EstadoCita.PENDIENTE;
    noteSuffix = "Solicitud de reprogramación recibida por WhatsApp.";
  }

  // Registra la respuesta entrante y actualiza el estado operativo de la cita.
  await prisma.$transaction([
    prisma.recordatorio.update({
      where: { citaId: appointment.id },
      data: {
        intencionRespuestaPaciente: intent,
        ultimoMensajeEntrante: input.body,
        recibidoEn: new Date(),
        estadoEntrega: "patient-replied"
      }
    }),
    prisma.cita.update({
      where: { id: appointment.id },
      data: {
        estado: nextStatus,
        observaciones: noteSuffix
          ? `${appointment.observaciones ? `${appointment.observaciones}\n` : ""}${noteSuffix}`
          : appointment.observaciones
      }
    })
  ]);

  await appendConversationMessage({
    citaId: appointment.id,
    direction: "INBOUND",
    cuerpoMensaje: input.body,
    proveedor: appointment.recordatorio.proveedor,
    sidMensajeProveedor: appointment.recordatorio.sidMensajeProveedor,
    estadoEntrega: "patient-replied",
    intencionDetectada: intent
  });

  return {
    twiml: buildInboundReply(intent),
    matched: true,
    intent
  };
}
