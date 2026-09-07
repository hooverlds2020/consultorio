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

function formatoHora(fecha: Date | string): string {
  return new Date(fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function TarjetaCita({ cita, onCambiarEstatus }: { cita: Cita; onCambiarEstatus: (id: string, estatus: EstatusCita) => void }) {
  return (
    <div
      className="rounded-md p-2 text-xs border-l-4 bg-white shadow-sm"
      style={{ borderLeftColor: ESTATUS_CITA_COLOR[cita.estatus] }}
    >
      <p className="font-medium text-gray-800">
        {formatoHora(cita.horaInicio)}–{formatoHora(cita.horaFin)}
      </p>
      <p className="text-gray-700">
        {cita.paciente.nombre} {cita.paciente.apellidos}
      </p>
      <p className="text-gray-500">{cita.tipoTratamiento}</p>
      <p className="text-gray-400">Dr(a). {cita.dentista.nombre} · Sillón {cita.sillon}</p>
      <select
        value={cita.estatus}
        onChange={(e) => onCambiarEstatus(cita.id, e.target.value as EstatusCita)}
        className="mt-1 w-full text-[11px] border border-gray-200 rounded px-1 py-0.5"
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
          className="mt-1 flex items-center justify-center gap-1 w-full text-[11px] bg-green-50 text-green-700 border border-green-200 rounded px-1 py-1 hover:bg-green-100 transition"
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => cargarFecha(sumarDiasEnZonaClinica(fecha, -1))}
            className="border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
          >
            ←
          </button>
          <input
            type="date"
            value={fecha}
            onChange={(e) => cargarFecha(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5"
          />
          <button
            onClick={() => cargarFecha(sumarDiasEnZonaClinica(fecha, 1))}
            className="border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
          >
            →
          </button>
          <button
            onClick={() => cargarFecha(hoyEnZonaClinica())}
            className="text-sm text-clinica-azul hover:underline ml-2"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden text-sm">
            <button
              onClick={() => setVista("sillon")}
              className={`px-3 py-1.5 ${vista === "sillon" ? "bg-clinica-azul text-white" : "bg-white text-gray-600"}`}
            >
              Por sillón
            </button>
            <button
              onClick={() => setVista("dentista")}
              className={`px-3 py-1.5 ${vista === "dentista" ? "bg-clinica-azul text-white" : "bg-white text-gray-600"}`}
            >
              Por dentista
            </button>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-clinica-azul text-white px-4 py-1.5 rounded-md text-sm hover:bg-clinica-azulOscuro transition"
          >
            + Nueva cita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={mostrarForm ? "md:col-span-3" : "md:col-span-4"}>
          <div
            className={`grid gap-3 ${isPending ? "opacity-50" : ""}`}
            style={{ gridTemplateColumns: `repeat(${columnas.length || 1}, minmax(0, 1fr))` }}
          >
            {columnas.map((col) => (
              <div key={col.clave} className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{col.titulo}</h3>
                <div className="space-y-2">
                  {col.citas.length === 0 && (
                    <p className="text-xs text-gray-400">Sin citas</p>
                  )}
                  {col.citas.map((cita) => (
                    <TarjetaCita key={cita.id} cita={cita} onCambiarEstatus={handleCambiarEstatus} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {mostrarForm && (
          <div>
            <NuevaCitaForm
              accion={crearCita}
              dentistas={dentistas}
              fechaInicial={fecha}
              onCreada={handleCitaCreada}
            />
          </div>
        )}
      </div>
    </div>
  );
}
