CREATE TABLE "MensajeConversacionWhatsApp" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "cuerpoMensaje" TEXT NOT NULL,
    "proveedor" TEXT,
    "sidMensajeProveedor" TEXT,
    "estadoEntrega" TEXT,
    "intencionDetectada" TEXT,
    "enviadoPorUsuarioId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensajeConversacionWhatsApp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MensajeConversacionWhatsApp_citaId_idx" ON "MensajeConversacionWhatsApp"("citaId");
CREATE INDEX "MensajeConversacionWhatsApp_creadoEn_idx" ON "MensajeConversacionWhatsApp"("creadoEn");

ALTER TABLE "MensajeConversacionWhatsApp"
ADD CONSTRAINT "MensajeConversacionWhatsApp_citaId_fkey"
FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE CASCADE ON UPDATE CASCADE;
