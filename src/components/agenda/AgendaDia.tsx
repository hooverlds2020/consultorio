"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { obtenerCitasDelDia, cambiarEstatusCita } from "@/actions/agenda";
import { hoyEnZonaClinica, sumarDiasEnZonaClinica } from "@/lib/fecha";
import AgendaTimeline from "./AgendaTimeline";
import NuevaCitaModal from "./NuevaCitaModal";
import type { EstatusCita } from "@prisma/client";

type Cita = Awaited<ReturnType<typeof obtenerCitasDelDia>>[number];
type Dentista = { id: string; nombre: string };
type Servicio = { id: string; nombre: string };

export default function AgendaDia({
  citasIniciales,
  dentistas,
  servicios,
  fechaInicial,
}: {
  citasIniciales: Cita[];
  dentistas: Dentista[];
  servicios: Servicio[];
  fechaInicial: string;
}) {
  const [fecha, setFecha] = useState(fechaInicial);
  const [citas, setCitas] = useState(citasIniciales);
  const [vista, setVista] = useState<"sillon" | "dentista">("sillon");
  const [mostrarModal, setMostrarModal] = useState(false);
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
    setMostrarModal(false);
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
          onClick={() => setMostrarModal(true)}
          className="w-full h-12 bg-clinica-azul text-white rounded-xl font-medium text-[16px] hover:bg-clinica-azulOscuro transition"
        >
          + Nueva cita
        </button>
      </div>

      <div className={isPending ? "opacity-50" : ""}>
        <AgendaTimeline columnas={columnas} onCambiarEstatus={handleCambiarEstatus} />
      </div>

      {mostrarModal && (
        <NuevaCitaModal
          dentistas={dentistas}
          servicios={servicios}
          fechaInicial={fecha}
          onCerrar={() => setMostrarModal(false)}
          onCreada={handleCitaCreada}
        />
      )}
    </div>
  );
}
