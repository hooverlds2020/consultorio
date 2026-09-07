"use client";

import { useRef, useState, useEffect } from "react";

export default function LienzoFirma({ onCambio }: { onCambio: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const [tieneTrazo, setTieneTrazo] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const contexto = canvas.getContext("2d");
    if (!contexto) return;
    contexto.lineWidth = 2;
    contexto.lineCap = "round";
    contexto.strokeStyle = "#1e293b";
  }, []);

  function obtenerPosicion(evento: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
  }

  function iniciarTrazo(evento: React.PointerEvent<HTMLCanvasElement>) {
    dibujando.current = true;
    const contexto = canvasRef.current!.getContext("2d")!;
    const { x, y } = obtenerPosicion(evento);
    contexto.beginPath();
    contexto.moveTo(x, y);
  }

  function continuarTrazo(evento: React.PointerEvent<HTMLCanvasElement>) {
    if (!dibujando.current) return;
    const contexto = canvasRef.current!.getContext("2d")!;
    const { x, y } = obtenerPosicion(evento);
    contexto.lineTo(x, y);
    contexto.stroke();
    if (!tieneTrazo) setTieneTrazo(true);
  }

  function terminarTrazo() {
    if (!dibujando.current) return;
    dibujando.current = false;
    const canvas = canvasRef.current!;
    onCambio(canvas.toDataURL("image/png"));
  }

  function limpiar() {
    const canvas = canvasRef.current!;
    const contexto = canvas.getContext("2d")!;
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    setTieneTrazo(false);
    onCambio(null);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={180}
        onPointerDown={iniciarTrazo}
        onPointerMove={continuarTrazo}
        onPointerUp={terminarTrazo}
        onPointerLeave={terminarTrazo}
        className="w-full border border-gray-300 rounded-md bg-white touch-none cursor-crosshair"
      />
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-400">Firma aquí con el dedo o el mouse</p>
        <button type="button" onClick={limpiar} className="text-xs text-red-500 hover:underline">
          Limpiar
        </button>
      </div>
    </div>
  );
}
