import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const emailAdmin = "hooverlds93@gmail.com";

  const existente = await prisma.usuario.findUnique({
    where: { email: emailAdmin },
  });

  if (existente) {
    console.log("El Super Admin ya existe, no se vuelve a crear.");
    return;
  }

  // ⚠️ Contraseña temporal — cámbiala dentro del sistema en cuanto entres
  const passwordTemporal = "CambiaEstaClave2026!";
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  await prisma.usuario.create({
    data: {
      nombre: "Roberto Carlos Hoover Silvano",
      email: emailAdmin,
      passwordHash,
      rol: "SUPER_ADMIN",
      activo: true,
    },
  });

  console.log("Super Admin creado:");
  console.log("  Email:", emailAdmin);
  console.log("  Contraseña temporal:", passwordTemporal);
  console.log("  ⚠️  Cambia esta contraseña en cuanto inicies sesión.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
