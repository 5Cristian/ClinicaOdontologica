-- AlterTable
ALTER TABLE "Recordatorio"
ADD COLUMN "proveedor" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "sidMensajeProveedor" TEXT,
ADD COLUMN "estadoEntrega" TEXT,
ADD COLUMN "ultimoError" TEXT;
