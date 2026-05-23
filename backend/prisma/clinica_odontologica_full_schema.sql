CREATE TYPE "RolNombre" AS ENUM ('ADMINISTRADOR', 'RECEPCION', 'ODONTOLOGO');

CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'ATENDIDA', 'NO_ASISTIO');

CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "hashContrasena" TEXT NOT NULL,
    "rol" "RolNombre" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL,
    "usuarioActorId" TEXT,
    "accion" TEXT NOT NULL,
    "tipoEntidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "descripcion" TEXT NOT NULL,
    "metadatos" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroAuditoria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "dpi" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "edad" INTEGER,
    "telefono" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "correo" TEXT,
    "direccion" TEXT,
    "historialMedico" TEXT,
    "alergias" TEXT,
    "observaciones" TEXT,
    "creadoPor" TEXT,
    "actualizadoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tratamiento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioEstimado" DECIMAL(10,2),
    "duracionAproximada" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPor" TEXT,
    "actualizadoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tratamiento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Cita" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "tratamientoId" TEXT NOT NULL,
    "programadaPara" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'FORMULARIO_PUBLICO',
    "recordatorioEnviado" BOOLEAN NOT NULL DEFAULT false,
    "recordatorioEnviadoEn" TIMESTAMP(3),
    "creadoPor" TEXT,
    "actualizadoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MensajeConversacionWhatsApp" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "cuerpoMensaje" TEXT NOT NULL,
    "proveedor" TEXT,
    "sidMensajeProveedor" TEXT,
    "estadoEntrega" TEXT,
    "intencionDetectada" TEXT,
    "enviadoPorUsuarioId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MensajeConversacionWhatsApp_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RegistroClinico" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "tratamientoId" TEXT,
    "diagnostico" TEXT NOT NULL,
    "piezaDental" TEXT,
    "medicamentos" TEXT,
    "notas" TEXT,
    "proximaCitaRecomendada" TIMESTAMP(3),
    "atendidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoPor" TEXT,
    "actualizadoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RegistroClinico_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Recordatorio" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'WHATSAPP_MANUAL',
    "mensaje" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL DEFAULT 'MANUAL',
    "sidMensajeProveedor" TEXT,
    "estadoEntrega" TEXT,
    "intencionRespuestaPaciente" TEXT,
    "ultimoMensajeEntrante" TEXT,
    "recibidoEn" TIMESTAMP(3),
    "ultimaRespuestaManual" TEXT,
    "ultimaRespuestaManualEn" TIMESTAMP(3),
    "ultimoError" TEXT,
    "enviadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Recordatorio_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConfiguracionClinica" (
    "id" TEXT NOT NULL,
    "nombreClinica" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "direccion" TEXT,
    "horarioAtencion" TEXT,
    "urlLogo" TEXT,
    "tituloSitio" TEXT,
    "descripcionSitio" TEXT,
    "fraseEncabezado" TEXT,
    "textoInsigniaHero" TEXT,
    "tituloHero" TEXT,
    "descripcionHero" TEXT,
    "tituloPaginaServicios" TEXT,
    "descripcionPaginaServicios" TEXT,
    "tituloPaginaReservas" TEXT,
    "descripcionPaginaReservas" TEXT,
    "tituloPaginaContacto" TEXT,
    "descripcionPaginaContacto" TEXT,
    "tituloPie" TEXT,
    "descripcionPie" TEXT,
    "urlFacebook" TEXT,
    "urlInstagram" TEXT,
    "mensajeWhatsappPredeterminado" TEXT,
    "creadoPor" TEXT,
    "actualizadoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ConfiguracionClinica_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TokenRefresco" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "hashToken" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "revocadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TokenRefresco_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");
CREATE INDEX "RegistroAuditoria_usuarioActorId_idx" ON "RegistroAuditoria"("usuarioActorId");
CREATE INDEX "RegistroAuditoria_tipoEntidad_idx" ON "RegistroAuditoria"("tipoEntidad");
CREATE INDEX "RegistroAuditoria_accion_idx" ON "RegistroAuditoria"("accion");
CREATE INDEX "RegistroAuditoria_creadoEn_idx" ON "RegistroAuditoria"("creadoEn");
CREATE UNIQUE INDEX "Paciente_dpi_key" ON "Paciente"("dpi");
CREATE INDEX "Paciente_nombreCompleto_idx" ON "Paciente"("nombreCompleto");
CREATE INDEX "Paciente_telefono_idx" ON "Paciente"("telefono");
CREATE UNIQUE INDEX "Tratamiento_nombre_key" ON "Tratamiento"("nombre");
CREATE UNIQUE INDEX "Tratamiento_slug_key" ON "Tratamiento"("slug");
CREATE INDEX "Cita_programadaPara_idx" ON "Cita"("programadaPara");
CREATE INDEX "Cita_estado_idx" ON "Cita"("estado");
CREATE INDEX "MensajeConversacionWhatsApp_citaId_idx" ON "MensajeConversacionWhatsApp"("citaId");
CREATE INDEX "MensajeConversacionWhatsApp_creadoEn_idx" ON "MensajeConversacionWhatsApp"("creadoEn");
CREATE UNIQUE INDEX "Recordatorio_citaId_key" ON "Recordatorio"("citaId");
CREATE UNIQUE INDEX "TokenRefresco_hashToken_key" ON "TokenRefresco"("hashToken");
CREATE INDEX "TokenRefresco_usuarioId_idx" ON "TokenRefresco"("usuarioId");

ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_usuarioActorId_fkey" FOREIGN KEY ("usuarioActorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_tratamientoId_fkey" FOREIGN KEY ("tratamientoId") REFERENCES "Tratamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MensajeConversacionWhatsApp" ADD CONSTRAINT "MensajeConversacionWhatsApp_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RegistroClinico" ADD CONSTRAINT "RegistroClinico_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RegistroClinico" ADD CONSTRAINT "RegistroClinico_tratamientoId_fkey" FOREIGN KEY ("tratamientoId") REFERENCES "Tratamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Recordatorio" ADD CONSTRAINT "Recordatorio_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TokenRefresco" ADD CONSTRAINT "TokenRefresco_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
