-- AlterTable
ALTER TABLE "Recordatorio"
ADD COLUMN "intencionRespuestaPaciente" TEXT,
ADD COLUMN "ultimoMensajeEntrante" TEXT,
ADD COLUMN "recibidoEn" TIMESTAMP(3);
