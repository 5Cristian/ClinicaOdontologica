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

CREATE INDEX "RegistroAuditoria_usuarioActorId_idx" ON "RegistroAuditoria"("usuarioActorId");
CREATE INDEX "RegistroAuditoria_tipoEntidad_idx" ON "RegistroAuditoria"("tipoEntidad");
CREATE INDEX "RegistroAuditoria_accion_idx" ON "RegistroAuditoria"("accion");
CREATE INDEX "RegistroAuditoria_creadoEn_idx" ON "RegistroAuditoria"("creadoEn");

ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_usuarioActorId_fkey" FOREIGN KEY ("usuarioActorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
