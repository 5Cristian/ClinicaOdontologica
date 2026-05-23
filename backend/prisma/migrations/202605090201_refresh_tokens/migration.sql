-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "TokenRefresco_hashToken_key" ON "TokenRefresco"("hashToken");
CREATE INDEX "TokenRefresco_usuarioId_idx" ON "TokenRefresco"("usuarioId");

-- AddForeignKey
ALTER TABLE "TokenRefresco"
ADD CONSTRAINT "TokenRefresco_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
