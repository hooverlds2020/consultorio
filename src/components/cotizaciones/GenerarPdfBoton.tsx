"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { obtenerLogoNegocio } from "@/actions/marca";

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

/** Convierte la imagen del logo a base64 para poder incrustarla en el PDF. */
async function obtenerLogoBase64(): Promise<string | null> {
  try {
    const logoUrl = (await obtenerLogoNegocio()) ?? "/logo-cesar-oficial.png";
    const respuesta = await fetch(logoUrl);
    const blob = await respuesta.blob();
    return await new Promise((resolve) => {
      const lector = new FileReader();
      lector.onloadend = () => resolve(lector.result as string);
      lector.onerror = () => resolve(null);
      lector.readAsDataURL(blob);
    });
  } catch {
    return null; // sin logo, el PDF se genera igual, solo sin la imagen
  }
}

/** Mide el ancho/alto real de la imagen para no deformarla al insertarla en el PDF. */
function medirImagen(base64: string): Promise<{ ancho: number; alto: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ ancho: img.naturalWidth, alto: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = base64;
  });
}

export default function GenerarPdfBoton({ cotizacion }: { cotizacion: CotizacionPdf }) {
  const [generando, setGenerando] = useState(false);

  async function handleGenerar() {
    setGenerando(true);
    const logoBase64 = await obtenerLogoBase64();

    const doc = new jsPDF();
    let xTexto = 14;

    if (logoBase64) {
      try {
        const medidas = await medirImagen(logoBase64);
        if (medidas && medidas.ancho > 0 && medidas.alto > 0) {
          const altoDeseado = 14; // mm — misma altura sin importar la forma del logo
          const anchoCalculado = altoDeseado * (medidas.ancho / medidas.alto);
          const anchoFinal = Math.min(anchoCalculado, 50); // tope para logos muy anchos
          const altoFinal = anchoFinal === anchoCalculado ? altoDeseado : anchoFinal * (medidas.alto / medidas.ancho);
          doc.addImage(logoBase64, "PNG", 14, 10, anchoFinal, altoFinal);
          xTexto = 14 + anchoFinal + 6; // el texto se recorre para no encimarse con el logo
        }
      } catch {
        // Si el formato de imagen no es compatible con jsPDF, seguimos sin logo.
      }
    }

    doc.setFontSize(16);
    doc.setTextColor(15, 111, 191); // azul clínica
    doc.text("Laboratorio y Consultorio Dental", xTexto, 18);

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text("Cotización de tratamiento", xTexto, 26);

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
    setGenerando(false);
  }

  return (
    <button
      onClick={handleGenerar}
      disabled={generando}
      className="text-sm border border-clinica-azul text-clinica-azul px-4 py-2 rounded-md hover:bg-clinica-azulClaro transition disabled:opacity-60"
    >
      {generando ? "Generando..." : "Descargar PDF"}
    </button>
  );
}
