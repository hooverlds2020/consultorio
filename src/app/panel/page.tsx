import { getServerSession } from "next-auth";
import { DollarSign, Wallet, Receipt, TrendingUp, FlaskConical } from "lucide-react";
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
  obtenerResumenFinanciero,
} from "@/actions/dashboard";
import { obtenerHorarioServicio } from "@/actions/horarioServicio";
import { diaSemanaDeFecha } from "@/lib/horarioServicio";
import { hoyEnZonaClinica, sumarDiasEnZonaClinica } from "@/lib/fecha";
import TarjetaKpi from "@/components/dashboard/TarjetaKpi";
import GraficaIngresos from "@/components/dashboard/GraficaIngresos";
import AgendaHoyLista from "@/components/dashboard/AgendaHoyLista";
import AlertasStock from "@/components/dashboard/AlertasStock";
import CumpleanosProximos from "@/components/dashboard/CumpleanosProximos";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const rol = session.user.rol;
  const hoy = hoyEnZonaClinica();

  // Próximos 3 días que la clínica SÍ atiende — si domingo está cerrado,
  // se salta y se muestra el siguiente día hábil en su lugar (según el
  // Horario de Servicio configurado en Configuración → Horario de atención).
  const horarios = puedeGestionarAgenda(rol) ? await obtenerHorarioServicio() : null;
  const proximosTresDias: string[] = [];
  if (horarios) {
    for (let i = 0; proximosTresDias.length < 3 && i < 21; i++) {
      const fecha = sumarDiasEnZonaClinica(hoy, i);
      const diaSemana = diaSemanaDeFecha(fecha);
      if (horarios[diaSemana]?.activo) proximosTresDias.push(fecha);
    }
  }

  const citasPorDia = puedeGestionarAgenda(rol)
    ? await Promise.all(
        proximosTresDias.map(async (fecha) => {
          const citasDia = await obtenerCitasDelDia(fecha);
          const filtradas =
            rol === "DENTISTA" ? citasDia.filter((c) => c.dentista.id === session.user.id) : citasDia;
          return { fecha, citas: filtradas };
        })
      )
    : [];

  const [cumpleanos, ordenesPendientes, insumosStockBajo, resumenFinanciero] = await Promise.all([
    puedeGestionarPacientes(rol) ? obtenerCumpleanosProximos(7) : Promise.resolve([]),
    puedeGestionarOrdenesLab(rol) ? obtenerConteoOrdenesLabPendientes() : Promise.resolve(0),
    puedeVerInventario(rol) ? obtenerInsumosStockBajo() : Promise.resolve([]),
    puedeVerFinanzas(rol) ? obtenerResumenFinanciero() : Promise.resolve(null),
  ]);

  const formatoMoneda = (n: number) =>
    `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div>
      <h1 className="text-[20px] md:text-2xl font-bold text-gray-900 mb-1">
        Hola, {session.user.name.split(" ")[0]}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Esto es lo que necesitas saber hoy, {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}.
      </p>

      {/* ============ SECCIÓN OPERATIVA — lo que hay que hacer hoy ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {puedeGestionarAgenda(rol) && <AgendaHoyLista citasPorDia={citasPorDia as any} />}

          {puedeGestionarOrdenesLab(rol) && (
            <div className="bg-white rounded-xl border shadow-sm p-4 md:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Órdenes de laboratorio</p>
                  <p className="text-xs text-gray-500">{ordenesPendientes} pendientes (recibidas o en proceso)</p>
                </div>
              </div>
              <a href="/panel/lab/ordenes" className="text-xs text-clinica-azul hover:underline whitespace-nowrap">
                Ver todas →
              </a>
            </div>
          )}
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4 md:space-y-6">
          {puedeVerInventario(rol) && <AlertasStock insumos={insumosStockBajo as any} />}
          {puedeGestionarPacientes(rol) && <CumpleanosProximos cumpleanos={cumpleanos as any} />}
        </div>
      </div>

      {/* ============ SECCIÓN FINANCIERA — cómo va el negocio ============ */}
      {resumenFinanciero && (
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Finanzas
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <TarjetaKpi
              titulo="Ingresos hoy"
              valor={formatoMoneda(resumenFinanciero.ingresosHoy)}
              icono={DollarSign}
              color="verde"
            />
            <TarjetaKpi
              titulo="Ingresos del mes"
              valor={formatoMoneda(resumenFinanciero.ingresosMes)}
              icono={TrendingUp}
              color="azul"
            />
            <TarjetaKpi
              titulo="Por cobrar"
              valor={formatoMoneda(resumenFinanciero.porCobrar)}
              subtitulo="Planes con saldo"
              icono={Wallet}
              color="naranja"
            />
            <TarjetaKpi
              titulo="Ticket promedio"
              valor={formatoMoneda(resumenFinanciero.ticketPromedio)}
              subtitulo="Este mes"
              icono={Receipt}
              color="morado"
            />
          </div>

          <GraficaIngresos serie={resumenFinanciero.serie7dias} />
        </div>
      )}
    </div>
  );
}
