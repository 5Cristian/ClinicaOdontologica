import dotenv from "dotenv";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient, RolNombre } from "@prisma/client";

// Carga el .env del backend aunque el script se invoque desde otra carpeta.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const hashContrasena = await bcrypt.hash("Admin12345*", saltRounds);

  // Fuerza que el administrador quede activo con la clave inicial conocida.
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

  console.log(`Administrador listo: ${admin.correo} / Admin12345*`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
