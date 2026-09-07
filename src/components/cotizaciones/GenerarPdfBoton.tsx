"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ItemPdf = {
  servicio: { nombre: string };
  cantidad: number;
  precioUnitario: string | number;
  subtotal: string | number;
};

type CotizacionPdf = {
  id: string;
  fecha: Date | string;
  total: string | number;
  paciente: { nombre: string; apellidos: string };
  items: ItemPdf[];
};

export default function GenerarPdfBoton({ cotizacion }: { cotizacion: CotizacionPdf }) {
  function handleGenerar() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(15, 111, 191); // azul clínica
    doc.text("Laboratorio y Consultorio Dental", 14, 18);

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text("Cotización de tratamiento", 14, 26);

    doc.setFontSize(10);
    doc.text(`Paciente: ${cotizacion.paciente.nombre} ${cotizacion.paciente.apellidos}`, 14, 36);
    doc.text(`Fecha: ${new Date(cotizacion.fecha).toLocaleDateString("es-MX")}`, 14, 42);
    doc.text(`Folio: ${cotizacion.id.slice(0, 8).toUpperCase()}`, 14, 48);

    autoTable(doc, {
      startY: 56,
      head: [["Servicio", "Cantidad", "Precio unitario", "Subtotal"]],
      body: cotizacion.items.map((item) => [
        item.servicio.nombre,
        String(item.cantidad),
        `$${Number(item.precioUnitario).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        `$${Number(item.subtotal).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [15, 111, 191] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(12);
    doc.setTextColor(15, 79, 135);
    doc.text(
      `Total: $${Number(cotizacion.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`,
      14,
      finalY + 10
    );

    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "Esta cotización tiene una vigencia de 30 días naturales a partir de su emisión.",
      14,
      finalY + 20
    );

    doc.save(`cotizacion_${cotizacion.paciente.apellidos}_${cotizacion.id.slice(0, 6)}.pdf`);
  }

  return (
    <button
      onClick={handleGenerar}
      className="text-sm border border-clinica-azul text-clinica-azul px-4 py-2 rounded-md hover:bg-clinica-azulClaro transition"
    >
      Descargar PDF
    </button>
  );
}
