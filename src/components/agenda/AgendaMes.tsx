"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { obtenerConteoCitasDelMes } from "@/actions/agenda";
import { diaSemanaDeFecha, type HorariosSemana } from "@/lib/horarioServicio";

type Conteo = { fecha: string; total: number; atrasadasONoShow: number };

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const NOMBRES_DIA_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function hoyISO(): string {
  return new Date().toLocaleDateString("en-CA");
}

export default function AgendaMes({
  anioInicial,
  mesInicial,
  conteoInicial,
  horarios,
}: {
  anioInicial: number;
  mesInicial: number; // 1-12
  conteoInicial: Conteo[];
  horarios: HorariosSemana;
}) {
  const [anio, setAnio] = useState(anioInicial);
  const [mes, setMes] = useState(mesInicial);
  const [conteo, setConteo] = useState<Conteo[]>(conteoInicial);
  const [isPending, startTransition] = useTransition();

  function cargarMes(nuevoAnio: number, nuevoMes: number) {
    setAnio(nuevoAnio);
    setMes(nuevoMes);
    startTransition(async () => {
      const nuevo = await obtenerConteoCitasDelMes(nuevoAnio, nuevoMes);
      setConteo(nuevo);
    });
  }

  function irMesAnterior() {
    if (mes === 1) cargarMes(anio - 1, 12);
    else cargarMes(anio, mes - 1);
  }

  function irMesSiguiente() {
    if (mes === 12) cargarMes(anio + 1, 1);
    else cargarMes(anio, mes + 1);
  }

  function irHoy() {
    const hoy = new Date();
    cargarMes(hoy.getFullYear(), hoy.getMonth() + 1);
  }

  const conteoPorFecha = useMemo(() => {
    const mapa = new Map<string, Conteo>();
    for (const c of conteo) mapa.set(c.fecha, c);
    return mapa;
  }, [conteo]);

  // Construye la cuadrícula del mes (incluyendo días del mes anterior/siguiente para rellenar)
  const celdas = useMemo(() => {
    const primerDiaMes = new Date(anio, mes - 1, 1);
    const diaSemanaInicio = primerDiaMes.getDay(); // 0=domingo
    const diasEnMes = new Date(anio, mes, 0).getDate();

    const lista: { fecha: string; diaDelMes: number; delMesActual: boolean }[] = [];

    // Días del mes anterior para completar la primera fila
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const d = new Date(anio, mes - 1, -i);
      lista.push({ fecha: d.toLocaleDateString("en-CA"), diaDelMes: d.getDate(), delMesActual: false });
    }
    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const d = new Date(anio, mes - 1, dia);
      lista.push({ fecha: d.toLocaleDateString("en-CA"), diaDelMes: dia, delMesActual: true });
    }
    // Completar hasta múltiplo de 7
    while (lista.length % 7 !== 0) {
      const ultimo = new Date(lista[lista.length - 1].fecha + "T12:00:00");
      const d = new Date(ultimo);
      d.setDate(d.getDate() + 1);
      lista.push({ fecha: d.toLocaleDateString("en-CA"), diaDelMes: d.getDate(), delMesActual: false });
    }
    return lista;
  }, [anio, mes]);

  const hoy = hoyISO();

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-clinica-azulOscuro">Agenda — Vista mensual</h1>
        <Link href="/panel/agenda" className="text-sm text-clinica-azul hover:underline">
          Ver día →
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={irMesAnterior}
          className="w-11 h-11 shrink-0 border rounded-xl hover:bg-gray-50"
          aria-label="Mes anterior"
        >
          ←
        </button>
        <div className="flex-1 h-11 rounded-xl border px-3 flex items-center justify-center font-medium bg-gray-50">
          {NOMBRES_MES[mes - 1]} {anio}
        </div>
        <button
          onClick={irMesSiguiente}
          className="w-11 h-11 shrink-0 border rounded-xl hover:bg-gray-50"
          aria-label="Mes siguiente"
        >
          →
        </button>
        <button onClick={irHoy} className="h-11 px-4 shrink-0 text-clinica-azul font-medium text-sm">
          Hoy
        </button>
      </div>

      <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isPending ? "opacity-60" : ""}`}>
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {NOMBRES_DIA_CORTO.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {celdas.map((celda) => {
            const datos = conteoPorFecha.get(celda.fecha);
            const esHoy = celda.fecha === hoy;
            const diaSemana = diaSemanaDeFecha(celda.fecha);
            const cerrado = !horarios[diaSemana]?.activo;

            return (
              <Link
                key={celda.fecha}
                href={`/panel/agenda?fecha=${celda.fecha}`}
                className={`min-h-[80px] md:min-h-[100px] border-b border-r p-1.5 md:p-2 flex flex-col hover:bg-clinica-azulClaro transition ${
                  !celda.delMesActual ? "bg-gray-50/50" : cerrado ? "bg-gray-50" : "bg-white"
                }`}
              >
                <span
                  className={`text-xs md:text-sm ${
                    !celda.delMesActual
                      ? "text-gray-300"
                      : esHoy
                      ? "w-6 h-6 flex items-center justify-center rounded-full bg-clinica-azul text-white font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {celda.diaDelMes}
                </span>
                {celda.delMesActual && datos && datos.total > 0 && (
                  <span
                    className={`mt-1 self-start text-[10px] md:text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      datos.atrasadasONoShow > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-clinica-azulClaro text-clinica-azulOscuro"
                    }`}
                  >
                    {datos.total} cita{datos.total === 1 ? "" : "s"}
                  </span>
                )}
                {celda.delMesActual && cerrado && (
                  <span className="mt-1 text-[10px] text-gray-400 italic">Cerrado</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
