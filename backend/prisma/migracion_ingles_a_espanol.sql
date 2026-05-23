BEGIN;

ALTER TYPE "RoleName" RENAME TO "RolNombre";
ALTER TYPE "AppointmentStatus" RENAME TO "EstadoCita";

ALTER TYPE "RolNombre" RENAME VALUE 'ADMIN' TO 'ADMINISTRADOR';
ALTER TYPE "EstadoCita" RENAME VALUE 'PENDING' TO 'PENDIENTE';
ALTER TYPE "EstadoCita" RENAME VALUE 'CONFIRMED' TO 'CONFIRMADA';
ALTER TYPE "EstadoCita" RENAME VALUE 'CANCELLED' TO 'CANCELADA';
ALTER TYPE "EstadoCita" RENAME VALUE 'ATTENDED' TO 'ATENDIDA';
ALTER TYPE "EstadoCita" RENAME VALUE 'NO_SHOW' TO 'NO_ASISTIO';

ALTER TABLE "User" RENAME TO "Usuario";
ALTER TABLE "Patient" RENAME TO "Paciente";
ALTER TABLE "Treatment" RENAME TO "Tratamiento";
ALTER TABLE "Appointment" RENAME TO "Cita";
ALTER TABLE "ClinicalRecord" RENAME TO "RegistroClinico";
ALTER TABLE "Reminder" RENAME TO "Recordatorio";
ALTER TABLE "ClinicConfig" RENAME TO "ConfiguracionClinica";
ALTER TABLE "RefreshToken" RENAME TO "TokenRefresco";
ALTER TABLE "AuditLog" RENAME TO "RegistroAuditoria";
ALTER TABLE "WhatsAppConversationMessage" RENAME TO "MensajeConversacionWhatsApp";

ALTER TABLE "Usuario" RENAME COLUMN "name" TO "nombre";
ALTER TABLE "Usuario" RENAME COLUMN "email" TO "correo";
ALTER TABLE "Usuario" RENAME COLUMN "passwordHash" TO "hashContrasena";
ALTER TABLE "Usuario" RENAME COLUMN "role" TO "rol";
ALTER TABLE "Usuario" RENAME COLUMN "isActive" TO "activo";
ALTER TABLE "Usuario" RENAME COLUMN "createdAt" TO "creadoEn";
ALTER TABLE "Usuario" RENAME COLUMN "updatedAt" TO "actualizadoEn";

ALTER TABLE "RegistroAuditoria" RENAME COLUMN "actorUserId" TO "usuarioActorId";
ALTER TABLE "RegistroAuditoria" RENAME COLUMN "action" TO "accion";
ALTER TABLE "RegistroAuditoria" RENAME COLUMN "entityType" TO "tipoEntidad";
ALTER TABLE "RegistroAuditoria" RENAME COLUMN "entityId" TO "entidadId";
ALTER TABLE "RegistroAuditoria" RENAME COLUMN "description" TO "descripcion";
ALTER TABLE "RegistroAuditoria" RENAME COLUMN "metadata" TO "metadatos";
ALTER TABLE "RegistroAuditoria" RENAME COLUMN "createdAt" TO "creadoEn";

ALTER TABLE "Paciente" RENAME COLUMN "fullName" TO "nombreCompleto";
ALTER TABLE "Paciente" RENAME COLUMN "dateOfBirth" TO "fechaNacimiento";
ALTER TABLE "Paciente" RENAME COLUMN "age" TO "edad";
ALTER TABLE "Paciente" RENAME COLUMN "phone" TO "telefono";
ALTER TABLE "Paciente" RENAME COLUMN "email" TO "correo";
ALTER TABLE "Paciente" RENAME COLUMN "address" TO "direccion";
ALTER TABLE "Paciente" RENAME COLUMN "medicalHistory" TO "historialMedico";
ALTER TABLE "Paciente" RENAME COLUMN "allergies" TO "alergias";
ALTER TABLE "Paciente" RENAME COLUMN "observations" TO "observaciones";
ALTER TABLE "Paciente" RENAME COLUMN "createdBy" TO "creadoPor";
ALTER TABLE "Paciente" RENAME COLUMN "updatedBy" TO "actualizadoPor";
ALTER TABLE "Paciente" RENAME COLUMN "createdAt" TO "creadoEn";
ALTER TABLE "Paciente" RENAME COLUMN "updatedAt" TO "actualizadoEn";

ALTER TABLE "Tratamiento" RENAME COLUMN "name" TO "nombre";
ALTER TABLE "Tratamiento" RENAME COLUMN "description" TO "descripcion";
ALTER TABLE "Tratamiento" RENAME COLUMN "estimatedPrice" TO "precioEstimado";
ALTER TABLE "Tratamiento" RENAME COLUMN "approximateLength" TO "duracionAproximada";
ALTER TABLE "Tratamiento" RENAME COLUMN "isActive" TO "activo";
ALTER TABLE "Tratamiento" RENAME COLUMN "createdBy" TO "creadoPor";
ALTER TABLE "Tratamiento" RENAME COLUMN "updatedBy" TO "actualizadoPor";
ALTER TABLE "Tratamiento" RENAME COLUMN "createdAt" TO "creadoEn";
ALTER TABLE "Tratamiento" RENAME COLUMN "updatedAt" TO "actualizadoEn";

ALTER TABLE "Cita" RENAME COLUMN "patientId" TO "pacienteId";
ALTER TABLE "Cita" RENAME COLUMN "treatmentId" TO "tratamientoId";
ALTER TABLE "Cita" RENAME COLUMN "scheduledAt" TO "programadaPara";
ALTER TABLE "Cita" RENAME COLUMN "status" TO "estado";
ALTER TABLE "Cita" RENAME COLUMN "reason" TO "motivo";
ALTER TABLE "Cita" RENAME COLUMN "observations" TO "observaciones";
ALTER TABLE "Cita" RENAME COLUMN "source" TO "origen";
ALTER TABLE "Cita" RENAME COLUMN "reminderSent" TO "recordatorioEnviado";
ALTER TABLE "Cita" RENAME COLUMN "reminderSentAt" TO "recordatorioEnviadoEn";
ALTER TABLE "Cita" RENAME COLUMN "createdBy" TO "creadoPor";
ALTER TABLE "Cita" RENAME COLUMN "updatedBy" TO "actualizadoPor";
ALTER TABLE "Cita" RENAME COLUMN "createdAt" TO "creadoEn";
ALTER TABLE "Cita" RENAME COLUMN "updatedAt" TO "actualizadoEn";
ALTER TABLE "Cita" ALTER COLUMN "origen" SET DEFAULT 'FORMULARIO_PUBLICO';

ALTER TABLE "MensajeConversacionWhatsApp" RENAME COLUMN "appointmentId" TO "citaId";
ALTER TABLE "MensajeConversacionWhatsApp" RENAME COLUMN "direction" TO "direccion";
ALTER TABLE "MensajeConversacionWhatsApp" RENAME COLUMN "messageBody" TO "cuerpoMensaje";
ALTER TABLE "MensajeConversacionWhatsApp" RENAME COLUMN "provider" TO "proveedor";
ALTER TABLE "MensajeConversacionWhatsApp" RENAME COLUMN "providerMessageSid" TO "sidMensajeProveedor";
ALTER TABLE "MensajeConversacionWhatsApp" RENAME COLUMN "deliveryStatus" TO "estadoEntrega";
ALTER TABLE "MensajeConversacionWhatsApp" RENAME COLUMN "intentDetected" TO "intencionDetectada";
ALTER TABLE "MensajeConversacionWhatsApp" RENAME COLUMN "sentByUserId" TO "enviadoPorUsuarioId";
ALTER TABLE "MensajeConversacionWhatsApp" RENAME COLUMN "createdAt" TO "creadoEn";

ALTER TABLE "RegistroClinico" RENAME COLUMN "patientId" TO "pacienteId";
ALTER TABLE "RegistroClinico" RENAME COLUMN "treatmentId" TO "tratamientoId";
ALTER TABLE "RegistroClinico" RENAME COLUMN "diagnosis" TO "diagnostico";
ALTER TABLE "RegistroClinico" RENAME COLUMN "toothPiece" TO "piezaDental";
ALTER TABLE "RegistroClinico" RENAME COLUMN "medications" TO "medicamentos";
ALTER TABLE "RegistroClinico" RENAME COLUMN "notes" TO "notas";
ALTER TABLE "RegistroClinico" RENAME COLUMN "nextRecommendedAppointment" TO "proximaCitaRecomendada";
ALTER TABLE "RegistroClinico" RENAME COLUMN "attendedAt" TO "atendidoEn";
ALTER TABLE "RegistroClinico" RENAME COLUMN "createdBy" TO "creadoPor";
ALTER TABLE "RegistroClinico" RENAME COLUMN "updatedBy" TO "actualizadoPor";
ALTER TABLE "RegistroClinico" RENAME COLUMN "createdAt" TO "creadoEn";
ALTER TABLE "RegistroClinico" RENAME COLUMN "updatedAt" TO "actualizadoEn";

ALTER TABLE "Recordatorio" RENAME COLUMN "appointmentId" TO "citaId";
ALTER TABLE "Recordatorio" RENAME COLUMN "channel" TO "canal";
ALTER TABLE "Recordatorio" RENAME COLUMN "message" TO "mensaje";
ALTER TABLE "Recordatorio" RENAME COLUMN "provider" TO "proveedor";
ALTER TABLE "Recordatorio" RENAME COLUMN "providerMessageSid" TO "sidMensajeProveedor";
ALTER TABLE "Recordatorio" RENAME COLUMN "deliveryStatus" TO "estadoEntrega";
ALTER TABLE "Recordatorio" RENAME COLUMN "patientResponseIntent" TO "intencionRespuestaPaciente";
ALTER TABLE "Recordatorio" RENAME COLUMN "lastInboundBody" TO "ultimoMensajeEntrante";
ALTER TABLE "Recordatorio" RENAME COLUMN "inboundAt" TO "recibidoEn";
ALTER TABLE "Recordatorio" RENAME COLUMN "lastManualReplyBody" TO "ultimaRespuestaManual";
ALTER TABLE "Recordatorio" RENAME COLUMN "lastManualReplyAt" TO "ultimaRespuestaManualEn";
ALTER TABLE "Recordatorio" RENAME COLUMN "lastError" TO "ultimoError";
ALTER TABLE "Recordatorio" RENAME COLUMN "sentAt" TO "enviadoEn";
ALTER TABLE "Recordatorio" RENAME COLUMN "createdAt" TO "creadoEn";
ALTER TABLE "Recordatorio" RENAME COLUMN "updatedAt" TO "actualizadoEn";

ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "clinicName" TO "nombreClinica";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "phone" TO "telefono";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "address" TO "direccion";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "attentionHours" TO "horarioAtencion";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "logoUrl" TO "urlLogo";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "facebookUrl" TO "urlFacebook";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "instagramUrl" TO "urlInstagram";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "defaultWhatsappMessage" TO "mensajeWhatsappPredeterminado";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "createdBy" TO "creadoPor";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "updatedBy" TO "actualizadoPor";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "createdAt" TO "creadoEn";
ALTER TABLE "ConfiguracionClinica" RENAME COLUMN "updatedAt" TO "actualizadoEn";

ALTER TABLE "ConfiguracionClinica"
  ADD COLUMN IF NOT EXISTS "tituloSitio" TEXT,
  ADD COLUMN IF NOT EXISTS "descripcionSitio" TEXT,
  ADD COLUMN IF NOT EXISTS "fraseEncabezado" TEXT,
  ADD COLUMN IF NOT EXISTS "textoInsigniaHero" TEXT,
  ADD COLUMN IF NOT EXISTS "tituloHero" TEXT,
  ADD COLUMN IF NOT EXISTS "descripcionHero" TEXT,
  ADD COLUMN IF NOT EXISTS "tituloPaginaServicios" TEXT,
  ADD COLUMN IF NOT EXISTS "descripcionPaginaServicios" TEXT,
  ADD COLUMN IF NOT EXISTS "tituloPaginaReservas" TEXT,
  ADD COLUMN IF NOT EXISTS "descripcionPaginaReservas" TEXT,
  ADD COLUMN IF NOT EXISTS "tituloPaginaContacto" TEXT,
  ADD COLUMN IF NOT EXISTS "descripcionPaginaContacto" TEXT,
  ADD COLUMN IF NOT EXISTS "tituloPie" TEXT,
  ADD COLUMN IF NOT EXISTS "descripcionPie" TEXT;

ALTER TABLE "TokenRefresco" RENAME COLUMN "userId" TO "usuarioId";
ALTER TABLE "TokenRefresco" RENAME COLUMN "tokenHash" TO "hashToken";
ALTER TABLE "TokenRefresco" RENAME COLUMN "expiresAt" TO "expiraEn";
ALTER TABLE "TokenRefresco" RENAME COLUMN "revokedAt" TO "revocadoEn";
ALTER TABLE "TokenRefresco" RENAME COLUMN "createdAt" TO "creadoEn";
ALTER TABLE "TokenRefresco" RENAME COLUMN "updatedAt" TO "actualizadoEn";

COMMIT;
