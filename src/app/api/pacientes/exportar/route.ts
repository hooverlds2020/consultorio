import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as XLSX from "xlsx";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import { calcularEdad } from "@/lib/validaciones/paciente.schema";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const pacientes = await prisma.paciente.findMany({
    where: { eliminadoEn: null },
    orderBy: { apellidos: "asc" },
  });

  const filas = pacientes.map((p) => ({
    Nombre: p.nombre,
    Apellidos: p.apellidos,
    Edad: calcularEdad(p.fechaNacimiento),
    "Fecha de nacimiento": new Date(p.fechaNacimiento).toLocaleDateString("es-MX"),
    Teléfono: p.telefono ?? "",
    WhatsApp: p.whatsapp ?? "",
    Dirección: p.direccion ?? "",
    Alergias: p.alergias ?? "",
    "Enfermedades sistémicas": p.enfermedadesSistemicas ?? "",
    "Medicamentos actuales": p.medicamentosActuales ?? "",
    "Contacto de emergencia": p.contactoEmergenciaNombre ?? "",
    "Teléfono de emergencia": p.contactoEmergenciaTelefono ?? "",
  }));

  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Pacientes");

  const buffer = XLSX.write(libro, { type: "buffer", bookType: "xlsx" });

  const fecha = new Date().toISOString().split("T")[0];

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pacientes_${fecha}.xlsx"`,
    },
  });
}
