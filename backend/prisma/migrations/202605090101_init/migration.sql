-- CreateEnum
CREATE TYPE "RolNombre" AS ENUM ('ADMINISTRADOR', 'RECEPCION', 'ODONTOLOGO');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'ATENDIDA', 'NO_ASISTIO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashContrasena" TEXT NOT NULL,
    "role" "RolNombre" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "dpi" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "age" INTEGER,
    "telefono" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
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

-- CreateTable
CREATE TABLE "Tratamiento" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "tratamientoId" TEXT NOT NULL,
    "programadaPara" TIMESTAMP(3) NOT NULL,
    "status" "EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'PUBLIC_FORM',
    "recordatorioEnviado" BOOLEAN NOT NULL DEFAULT false,
    "recordatorioEnviadoEn" TIMESTAMP(3),
    "creadoPor" TEXT,
    "actualizadoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroClinico" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "tratamientoId" TEXT,
    "diagnosis" TEXT NOT NULL,
    "piezaDental" TEXT,
    "medicamentos" TEXT,
    "notas" TEXT,
    "nextRecommendedCita" TIMESTAMP(3),
    "atendidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoPor" TEXT,
    "actualizadoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RegistroClinico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recordatorio" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'WHATSAPP_MANUAL',
    "mensaje" TEXT NOT NULL,
    "enviadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Recordatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionClinica" (
    "id" TEXT NOT NULL,
    "nombreClinica" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "direccion" TEXT,
    "horarioAtencion" TEXT,
    "urlLogo" TEXT,
    "urlFacebook" TEXT,
    "urlInstagram" TEXT,
    "mensajeWhatsappPredeterminado" TEXT,
    "creadoPor" TEXT,
    "actualizadoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ConfiguracionClinica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Paciente_dpi_key" ON "Paciente"("dpi");
CREATE INDEX "Paciente_nombreCompleto_idx" ON "Paciente"("nombreCompleto");
CREATE INDEX "Paciente_telefono_idx" ON "Paciente"("telefono");
CREATE UNIQUE INDEX "Tratamiento_name_key" ON "Tratamiento"("name");
CREATE UNIQUE INDEX "Tratamiento_slug_key" ON "Tratamiento"("slug");
CREATE INDEX "Cita_programadaPara_idx" ON "Cita"("programadaPara");
CREATE INDEX "Cita_status_idx" ON "Cita"("status");
CREATE UNIQUE INDEX "Recordatorio_citaId_key" ON "Recordatorio"("citaId");

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_tratamientoId_fkey" FOREIGN KEY ("tratamientoId") REFERENCES "Tratamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RegistroClinico" ADD CONSTRAINT "RegistroClinico_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RegistroClinico" ADD CONSTRAINT "RegistroClinico_tratamientoId_fkey" FOREIGN KEY ("tratamientoId") REFERENCES "Tratamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Recordatorio" ADD CONSTRAINT "Recordatorio_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
