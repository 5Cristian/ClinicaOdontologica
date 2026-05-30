ALTER TABLE "Tratamiento"
ADD COLUMN "imagenes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "ConfiguracionClinica"
ADD COLUMN "imagenesNegocio" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
