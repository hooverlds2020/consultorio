"use client";

import jsPDF from "jspdf";
import { METODO_PAGO_LABEL } from "@/lib/validaciones/pago.schema";

type PagoRecibo = {
  folioRecibo: string;
  fecha: Date | string;
  monto: string | number;
  metodo: string;
  paciente: { nombre: string; apellidos: string };
  registradoPor: { nombre: string };
};

export default function ReciboPdfBoton({ pago }: { pago: PagoRecibo }) {
  function handleGenerar() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(15, 111, 191);
    doc.text("Consultorio Dental", 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("Recibo de pago", 14, 28);

    doc.setFontSize(10);
    doc.text(`Folio: ${pago.folioRecibo}`, 14, 40);
    doc.text(`Fecha: ${new Date(pago.fecha).toLocaleDateString("es-MX")}`, 14, 46);
    doc.text(`Paciente: ${pago.paciente.nombre} ${pago.paciente.apellidos}`, 14, 52);
    doc.text(`Método de pago: ${METODO_PAGO_LABEL[pago.metodo]}`, 14, 58);
    doc.text(`Registrado por: ${pago.registradoPor.nombre}`, 14, 64);

    doc.setFontSize(14);
    doc.setTextColor(15, 79, 135);
    doc.text(
      `Monto: $${Number(pago.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`,
      14,
      80
    );

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Este recibo es un comprobante interno de pago.", 14, 100);

    doc.save(`recibo_${pago.folioRecibo}.pdf`);
  }

  return (
    <button
      onClick={handleGenerar}
      className="text-xs text-clinica-azul border border-clinica-azul rounded px-2 py-1 hover:bg-clinica-azulClaro transition"
    >
      Recibo PDF
    </button>
  );
}
