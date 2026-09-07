import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { puedeGestionarPacientes } from "@/lib/permisos";
import { prisma } from "@/lib/prisma";
import BuscadorPacientes from "@/components/pacientes/BuscadorPacientes";

export default async function PacientesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !puedeGestionarPacientes(session.user.rol)) {
    redirect("/panel");
  }

  const pacientes = await prisma.paciente.findMany({
    where: { eliminadoEn: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      fechaNacimiento: true,
      telefono: true,
      whatsapp: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinica-azulOscuro mb-6">Pacientes</h1>
      <BuscadorPacientes pacientesIniciales={pacientes} />
    </div>
  );
}
