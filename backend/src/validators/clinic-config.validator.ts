import { z } from "zod";

const mediaPathSchema = z.string().startsWith("/uploads/");
const publicUrlSchema = z.string().url();
const mediaRefSchema = z.union([mediaPathSchema, publicUrlSchema]);

export const clinicConfigSchema = z.object({
  body: z.object({
    nombreClinica: z.string().min(3).max(160),
    telefono: z.string().min(8).max(32),
    whatsapp: z.string().min(8).max(32),
    direccion: z.string().max(255).optional().nullable(),
    horarioAtencion: z.string().max(255).optional().nullable(),
    urlLogo: mediaRefSchema.optional().nullable(),
    imagenesNegocio: z.array(mediaRefSchema).max(20).default([]),
    tituloSitio: z.string().max(160).optional().nullable(),
    descripcionSitio: z.string().max(255).optional().nullable(),
    fraseEncabezado: z.string().max(160).optional().nullable(),
    textoInsigniaHero: z.string().max(120).optional().nullable(),
    tituloHero: z.string().max(200).optional().nullable(),
    descripcionHero: z.string().max(500).optional().nullable(),
    tituloPaginaServicios: z.string().max(200).optional().nullable(),
    descripcionPaginaServicios: z.string().max(500).optional().nullable(),
    tituloPaginaReservas: z.string().max(200).optional().nullable(),
    descripcionPaginaReservas: z.string().max(500).optional().nullable(),
    tituloPaginaContacto: z.string().max(200).optional().nullable(),
    descripcionPaginaContacto: z.string().max(500).optional().nullable(),
    tituloPie: z.string().max(160).optional().nullable(),
    descripcionPie: z.string().max(255).optional().nullable(),
    urlFacebook: publicUrlSchema.optional().nullable(),
    urlInstagram: publicUrlSchema.optional().nullable(),
    mensajeWhatsappPredeterminado: z.string().max(500).optional().nullable()
  })
});
