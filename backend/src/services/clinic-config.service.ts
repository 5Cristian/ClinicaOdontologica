import { prisma } from "@/config/prisma";

type ConfiguracionClinicaInput = {
  nombreClinica: string;
  telefono: string;
  whatsapp: string;
  direccion?: string | null;
  horarioAtencion?: string | null;
  urlLogo?: string | null;
  tituloSitio?: string | null;
  descripcionSitio?: string | null;
  fraseEncabezado?: string | null;
  textoInsigniaHero?: string | null;
  tituloHero?: string | null;
  descripcionHero?: string | null;
  tituloPaginaServicios?: string | null;
  descripcionPaginaServicios?: string | null;
  tituloPaginaReservas?: string | null;
  descripcionPaginaReservas?: string | null;
  tituloPaginaContacto?: string | null;
  descripcionPaginaContacto?: string | null;
  tituloPie?: string | null;
  descripcionPie?: string | null;
  urlFacebook?: string | null;
  urlInstagram?: string | null;
  mensajeWhatsappPredeterminado?: string | null;
};

export async function getConfiguracionClinica() {
  return prisma.configuracionClinica.findFirst();
}

export async function upsertConfiguracionClinica(input: ConfiguracionClinicaInput, usuarioId?: string) {
  const existing = await prisma.configuracionClinica.findFirst();

  if (!existing) {
    // Crea una configuracion unica que mezcla datos operativos y contenido publico editable.
    return prisma.configuracionClinica.create({
      data: {
        ...input,
        creadoPor: usuarioId,
        actualizadoPor: usuarioId
      }
    });
  }

  // Mantiene una sola fila de configuracion para simplificar el consumo desde el frontend.
  return prisma.configuracionClinica.update({
    where: { id: existing.id },
    data: {
      ...input,
      actualizadoPor: usuarioId
    }
  });
}
