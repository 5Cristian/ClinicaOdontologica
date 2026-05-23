import type { ConfiguracionClinica } from "@/types/api";

export const defaultClinicContent = {
  nombreClinica: "Clinica Dental Sonrisa Integral",
  tituloSitio: "Clinica Dental Sonrisa Integral",
  descripcionSitio: "Clinica odontologica moderna con reservas en linea, seguimiento y atencion profesional.",
  fraseEncabezado: "Atencion odontologica profesional",
  textoInsigniaHero: "Clinica odontologica moderna",
  tituloHero: "Atencion dental profesional con reservas en linea y seguimiento real.",
  descripcionHero:
    "Gestiona citas, conoce los servicios de la clinica y mantente en contacto con un equipo odontologico profesional.",
  tituloPaginaServicios: "Portafolio odontologico para prevencion, estetica y rehabilitacion.",
  descripcionPaginaServicios: "Explora los tratamientos disponibles y conoce la oferta clinica actual.",
  tituloPaginaReservas: "Reserva una cita segun la disponibilidad real de la clinica.",
  descripcionPaginaReservas: "Selecciona fecha, tratamiento y horario disponible para enviar tu solicitud al sistema.",
  tituloPaginaContacto: "Ubicacion, canales de atencion y acceso rapido a WhatsApp.",
  descripcionPaginaContacto: "Encuentra la informacion principal de contacto y el horario de atencion.",
  tituloPie: "Clinica Dental Sonrisa Integral",
  descripcionPie: "Sistema web odontologico con pagina publica, agenda y gestion administrativa."
} as const;

// Resuelve los textos publicos usando la configuracion persistida o valores por defecto.
export function resolveClinicContent(config?: ConfiguracionClinica | null) {
  return {
    nombreClinica: config?.nombreClinica || defaultClinicContent.nombreClinica,
    tituloSitio: config?.tituloSitio || config?.nombreClinica || defaultClinicContent.tituloSitio,
    descripcionSitio: config?.descripcionSitio || defaultClinicContent.descripcionSitio,
    fraseEncabezado: config?.fraseEncabezado || defaultClinicContent.fraseEncabezado,
    textoInsigniaHero: config?.textoInsigniaHero || defaultClinicContent.textoInsigniaHero,
    tituloHero: config?.tituloHero || defaultClinicContent.tituloHero,
    descripcionHero: config?.descripcionHero || defaultClinicContent.descripcionHero,
    tituloPaginaServicios: config?.tituloPaginaServicios || defaultClinicContent.tituloPaginaServicios,
    descripcionPaginaServicios:
      config?.descripcionPaginaServicios || defaultClinicContent.descripcionPaginaServicios,
    tituloPaginaReservas: config?.tituloPaginaReservas || defaultClinicContent.tituloPaginaReservas,
    descripcionPaginaReservas:
      config?.descripcionPaginaReservas || defaultClinicContent.descripcionPaginaReservas,
    tituloPaginaContacto: config?.tituloPaginaContacto || defaultClinicContent.tituloPaginaContacto,
    descripcionPaginaContacto:
      config?.descripcionPaginaContacto || defaultClinicContent.descripcionPaginaContacto,
    tituloPie: config?.tituloPie || config?.nombreClinica || defaultClinicContent.tituloPie,
    descripcionPie: config?.descripcionPie || defaultClinicContent.descripcionPie
  };
}

// Genera iniciales cortas para el bloque de marca del header.
export function getClinicInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
