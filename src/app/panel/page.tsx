import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import {
  puedeGestionarPacientes,
  puedeGestionarPagos,
  puedeVerFinanzas,
  puedeGestionarOrdenesLab,
  puedeVerInventario,
  puedeGestionarAgenda,
} from "@/lib/permisos";
import { obtenerCitasDelDia } from "@/actions/agenda";
import {
  obtenerCumpleanosProximos,
  obtenerPlanesConSaldoPendiente,
  obtenerConteoOrdenesLabPendientes,
  obtenerInsumosStockBajo,
} from "@/actions/dashboard";
import { hoyEnZonaClinica } from "@/lib/fecha";

function Tarjeta({
  titulo,
  children,
  href,
}: {
  titulo: string;
  children: React.ReactNode;
  href?: string;
}) {
  const contenido = (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border h-full">
      <h3 className="text-sm font-medium text-gray-500 mb-3">{titulo}</h3>
      {children}
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:shadow-md transition rounded-lg">
      {contenido}
    </Link>
  ) : (
    contenido
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const rol = session.user.rol;
  const hoy = hoyEnZonaClinica();

  const citasHoy = puedeGestionarAgenda(rol) ? await obtenerCitasDelDia(hoy) : [];
  const citasRelevantes =
    rol === "DENTISTA" ? citasHoy.filter((c) => c.dentista.id === session.user.id) : citasHoy;

  const [cumpleanos, planesConSaldo, ordenesPendientes, insumosStockBajo] = await Promise.all([
    puedeGestionarPacientes(rol) ? obtenerCumpleanosProximos(7) : Promise.resolve([]),
    puedeGestionarPagos(rol) || puedeVerFinanzas(rol)
      ? obtenerPlanesConSaldoPendiente()
      : Promise.resolve([]),
    puedeGestionarOrdenesLab(rol) ? obtenerConteoOrdenesLabPendientes() : Promise.resolve(0),
    puedeVerInventario(rol) ? obtenerInsumosStockBajo() : Promise.resolve([]),
  ]);

  return (
    <div>
      <h1 className="text-[18px] md:text-2xl font-bold text-clinica-azulOscuro mb-4 md:mb-6">
        Bienvenido, {session.user.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {puedeGestionarAgenda(rol) && (
          <Tarjeta titulo={rol === "DENTISTA" ? "Tus citas de hoy" : "Citas de hoy"} href="/panel/agenda">
            <p className="text-3xl font-bold text-clinica-azulOscuro">{citasRelevantes.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {citasRelevantes.length === 0 ? "Sin citas programadas" : "citas programadas"}
            </p>
          </Tarjeta>
        )}

        {puedeGestionarOrdenesLab(rol) && (
          <Tarjeta titulo="Órdenes de laboratorio pendientes" href="/panel/lab/ordenes">
            <p className="text-3xl font-bold text-clinica-azulOscuro">{ordenesPendientes}</p>
            <p className="text-sm text-gray-500 mt-1">recibidas o en proceso</p>
          </Tarjeta>
        )}

        {(puedeGestionarPagos(rol) || puedeVerFinanzas(rol)) && (
          <Tarjeta titulo="Planes con saldo pendiente">
            <p className="text-3xl font-bold text-clinica-azulOscuro">{planesConSaldo.length}</p>
            {planesConSaldo.slice(0, 3).map((p) => (
              <p key={p.id} className="text-xs text-gray-500 mt-1">
                {p.paciente.nombre} {p.paciente.apellidos} — $
                {p.saldoPendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            ))}
          </Tarjeta>
        )}

        {puedeVerInventario(rol) && (
          <Tarjeta titulo="Insumos con stock bajo" href="/panel/inventario">
            <p className="text-3xl font-bold text-red-600">{insumosStockBajo.length}</p>
            {insumosStockBajo.slice(0, 3).map((i) => (
              <p key={i.id} className="text-xs text-gray-500 mt-1">
                {i.nombre}
              </p>
            ))}
          </Tarjeta>
        )}

        {puedeGestionarPacientes(rol) && (
          <Tarjeta titulo="Cumpleaños próximos (7 días)">
            <p className="text-3xl font-bold text-clinica-azulOscuro">{cumpleanos.length}</p>
            {cumpleanos.slice(0, 4).map((p) => (
              <p key={p.id} className="text-xs text-gray-500 mt-1">
                {p.nombre} {p.apellidos} —{" "}
                {p.diferenciaDias === 0 ? "¡hoy!" : `en ${p.diferenciaDias} día(s)`}
              </p>
            ))}
          </Tarjeta>
        )}
      </div>
    </div>
  );
}
