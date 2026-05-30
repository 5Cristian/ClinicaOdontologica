ALTER TABLE "Cita"
ADD COLUMN "confirmacionWhatsappEnviada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "confirmacionWhatsappEnviadaEn" TIMESTAMP(3),
ADD COLUMN "recordatorioUnDiaEnviado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "recordatorioUnDiaEnviadoEn" TIMESTAMP(3),
ADD COLUMN "ultimoErrorWhatsapp" TEXT;

CREATE INDEX "Cita_confirmacionWhatsappEnviada_idx" ON "Cita"("confirmacionWhatsappEnviada");
CREATE INDEX "Cita_recordatorioUnDiaEnviado_idx" ON "Cita"("recordatorioUnDiaEnviado");
