"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerCitasDelDia,
  cambiarEstatusCita,
  crearCita,
} from "@/actions/agenda";
import { ESTATUS_CITA_LABEL, ESTATUS_CITA_COLOR } from "@/lib/validaciones/cita.schema";
import { hoyEnZonaClinica, sumarDiasEnZonaClinica } from "@/lib/fecha";
import { construirLinkWhatsapp, mensajeRecordatorioCita } from "@/lib/whatsapp";
import NuevaCitaForm from "./NuevaCitaForm";
import type { EstatusCita } from "@prisma/client";

type Cita = Awaited<ReturnType<typeof obtenerCitasDelDia>>[number];
type Dentista = { id: string; nombre: string };

const OPCIONES_ESTATUS: EstatusCita[] = [
  "PROGRAMADA",
  "CONFIRMADA",
  "COMPLETADA",
  "CANCELADA",
  "NO_ASISTIO",
];

const PUNTO_COLUMNA = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];

/**
 * Devuelve una clase Tailwind ESTÁTICA (nunca generada dinámicamente)
 * para el número de columnas en escritorio. Usar clases estáticas —en vez
 * de construir el nombre con un template string— evita que el build de
 * Tailwind las purgue por no poder detectarlas al analizar el código.
 */
function gridColsDesktop(cantidad: number): string {
  switch (cantidad) {
    case 1:
      return "lg:grid-cols-1";
    case 2:
      return "lg:grid-cols-2";
    case 3:
      return "lg:grid-cols-3";
    case 4:
      return "lg:grid-cols-4";
    default:
      return "lg:grid-cols-5";
  }
}

function formatoHora(fecha: Date | string): string {
  return new Date(fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function TarjetaCita({ cita, onCambiarEstatus }: { cita: Cita; onCambiarEstatus: (id: string, estatus: EstatusCita) => void }) {
  return (
    <div
      className="rounded-xl p-3 text-sm border-l-4 bg-white"
      style={{ borderLeftColor: ESTATUS_CITA_COLOR[cita.estatus] }}
    >
      <p className="font-medium text-gray-800">
        {formatoHora(cita.horaInicio)}–{formatoHora(cita.horaFin)}
      </p>
      <p className="text-gray-700">
        {cita.paciente.nombre} {cita.paciente.apellidos}
      </p>
      <p className="text-gray-500 text-xs">{cita.tipoTratamiento}</p>
      <p className="text-gray-400 text-xs">Dr(a). {cita.dentista.nombre} · Sillón {cita.sillon}</p>
      <select
        value={cita.estatus}
        onChange={(e) => onCambiarEstatus(cita.id, e.target.value as EstatusCita)}
        className="mt-2 w-full h-9 text-sm border border-gray-200 rounded-lg px-2"
      >
        {OPCIONES_ESTATUS.map((e) => (
          <option key={e} value={e}>
            {ESTATUS_CITA_LABEL[e]}
          </option>
        ))}
      </select>
      {cita.paciente.whatsapp && (
        <a
          href={construirLinkWhatsapp(
            cita.paciente.whatsapp,
            mensajeRecordatorioCita({
              nombrePaciente: cita.paciente.nombre,
              fecha: cita.fecha,
              horaInicio: cita.horaInicio,
              tipoTratamiento: cita.tipoTratamiento,
            })
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-1 w-full h-9 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 hover:bg-green-100 transition"
        >
          Enviar recordatorio WhatsApp
        </a>
      )}
    </div>
  );
}

export default function AgendaDia({
  citasIniciales,
  dentistas,
  fechaInicial,
}: {
  citasIniciales: Cita[];
  dentistas: Dentista[];
  fechaInicial: string;
}) {
  const [fecha, setFecha] = useState(fechaInicial);
  const [citas, setCitas] = useState(citasIniciales);
  const [vista, setVista] = useState<"sillon" | "dentista">("sillon");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function cargarFecha(nuevaFecha: string) {
    setFecha(nuevaFecha);
    startTransition(async () => {
      const nuevasCitas = await obtenerCitasDelDia(nuevaFecha);
      setCitas(nuevasCitas);
    });
  }

  function handleCambiarEstatus(citaId: string, estatus: EstatusCita) {
    startTransition(async () => {
      await cambiarEstatusCita(citaId, estatus);
      const nuevasCitas = await obtenerCitasDelDia(fecha);
      setCitas(nuevasCitas);
    });
  }

  function handleCitaCreada() {
    setMostrarForm(false);
    startTransition(async () => {
      const nuevasCitas = await obtenerCitasDelDia(fecha);
      setCitas(nuevasCitas);
    });
    router.refresh();
  }

  const columnas =
    vista === "sillon"
      ? [
          { clave: "1", titulo: "Sillón 1", citas: citas.filter((c) => c.sillon === 1) },
          { clave: "2", titulo: "Sillón 2", citas: citas.filter((c) => c.sillon === 2) },
        ]
      : dentistas.map((d) => ({
          clave: d.id,
          titulo: d.nombre,
          citas: citas.filter((c) => c.dentista.id === d.id),
        }));

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <h1 className="text-[22px] font-bold text-clinica-azulOscuro mb-4">Agenda</h1>

      {/* Controles de fecha — botones grandes para el dedo */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => cargarFecha(sumarDiasEnZonaClinica(fecha, -1))}
          className="w-11 h-11 shrink-0 border rounded-xl hover:bg-gray-50"
          aria-label="Día anterior"
        >
          ←
        </button>
        <div className="flex-1">
          <input
            type="date"
            value={fecha}
            onChange={(e) => cargarFecha(e.target.value)}
            className="w-full h-11 rounded-xl border px-3 text-[16px] bg-gray-50 text-center font-medium"
          />
        </div>
        <button
          onClick={() => cargarFecha(sumarDiasEnZonaClinica(fecha, 1))}
          className="w-11 h-11 shrink-0 border rounded-xl hover:bg-gray-50"
          aria-label="Día siguiente"
        >
          →
        </button>
        <button
          onClick={() => cargarFecha(hoyEnZonaClinica())}
          className="h-11 px-4 shrink-0 text-clinica-azul font-medium text-sm"
        >
          Hoy
        </button>
      </div>

      {/* Tabs + Nueva cita */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex w-full bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setVista("sillon")}
            className={`flex-1 h-10 rounded-lg font-medium transition ${
              vista === "sillon" ? "bg-clinica-azul text-white" : "text-gray-600"
            }`}
          >
            Por sillón
          </button>
          <button
            onClick={() => setVista("dentista")}
            className={`flex-1 h-10 rounded-lg font-medium transition ${
              vista === "dentista" ? "bg-clinica-azul text-white" : "text-gray-600"
            }`}
          >
            Por dentista
          </button>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="w-full h-12 bg-clinica-azul text-white rounded-xl font-medium text-[16px] hover:bg-clinica-azulOscuro transition"
        >
          {mostrarForm ? "Cerrar formulario" : "+ Nueva cita"}
        </button>
      </div>

      {mostrarForm && (
        <div className="mb-6">
          <NuevaCitaForm
            accion={crearCita}
            dentistas={dentistas}
            fechaInicial={fecha}
            onCreada={handleCitaCreada}
          />
        </div>
      )}

      {/* Columnas — 1 por fila en móvil, se acomodan en fila desde lg */}
      <div
        className={`grid grid-cols-1 ${gridColsDesktop(columnas.length)} gap-4 ${isPending ? "opacity-50" : ""}`}
      >
        {columnas.map((col, i) => (
          <div key={col.clave} className="bg-white rounded-2xl border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${PUNTO_COLUMNA[i % PUNTO_COLUMNA.length]}`} />
                {col.titulo}
              </h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {col.citas.length} cita{col.citas.length === 1 ? "" : "s"}
              </span>
            </div>

            {col.citas.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">
                <p className="text-sm">Sin citas</p>
                <p className="text-xs mt-1">Toca + para agendar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {col.citas.map((cita) => (
                  <TarjetaCita key={cita.id} cita={cita} onCambiarEstatus={handleCambiarEstatus} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
