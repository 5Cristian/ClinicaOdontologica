import dotenv from "dotenv";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient, RolNombre } from "@prisma/client";

// Carga el .env del backend aunque el script se invoque desde otra carpeta.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

const treatments = [
  "Limpieza dental",
  "Blanqueamiento dental",
  "Ortodoncia",
  "Extraccion dental",
  "Endodoncia",
  "Restauracion dental",
  "Protesis dental",
  "Implante dental",
  "Consulta general"
];

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const hashContrasena = await bcrypt.hash("Admin12345*", saltRounds);

  const admin = await prisma.usuario.upsert({
    where: { correo: "admin@clinica.com" },
    update: {
      nombre: "Administrador General",
      hashContrasena,
      rol: RolNombre.ADMINISTRADOR,
      activo: true
    },
    create: {
      nombre: "Administrador General",
      correo: "admin@clinica.com",
      hashContrasena,
      rol: RolNombre.ADMINISTRADOR,
      activo: true
    }
  });

  for (const treatmentName of treatments) {
    const slug = treatmentName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    await prisma.tratamiento.upsert({
      where: { slug },
      update: {
        nombre: treatmentName,
        descripcion: `Servicio odontologico de ${treatmentName.toLowerCase()}.`,
        actualizadoPor: admin.id
      },
      create: {
        nombre: treatmentName,
        slug,
        descripcion: `Servicio odontologico de ${treatmentName.toLowerCase()}.`,
        creadoPor: admin.id,
        actualizadoPor: admin.id
      }
    });
  }

  const existingConfig = await prisma.configuracionClinica.findFirst();

  if (!existingConfig) {
    await prisma.configuracionClinica.create({
      data: {
        nombreClinica: "Clinica Dental Sonrisa Integral",
        telefono: "+50255550000",
        whatsapp: "50255550000",
        direccion: "Ciudad de Guatemala, Guatemala",
        horarioAtencion: "Lunes a Viernes de 8:00 a 18:00, Sabado de 8:00 a 13:00",
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
        descripcionPaginaReservas:
          "Selecciona fecha, tratamiento y horario disponible para enviar tu solicitud al sistema.",
        tituloPaginaContacto: "Ubicacion, canales de atencion y acceso rapido a WhatsApp.",
        descripcionPaginaContacto: "Encuentra la informacion principal de contacto y el horario de atencion.",
        tituloPie: "Clinica Dental Sonrisa Integral",
        descripcionPie: "Sistema web odontologico con pagina publica, agenda y gestion administrativa.",
        mensajeWhatsappPredeterminado:
          "Hola [Nombre], le recordamos su cita odontologica en [Nombre de la Clinica] el dia [Fecha] a las [Hora]. Por favor confirmar su asistencia. Gracias.",
        creadoPor: admin.id,
        actualizadoPor: admin.id
      }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
