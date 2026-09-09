"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

/**
 * Input de archivos con drag&drop, pero sigue siendo un <input type="file">
 * normal por debajo — el formulario que lo contiene no cambia en nada del
 * lado del servidor, solo mejora cómo se seleccionan los archivos.
 */
export default function DropzoneArchivos({
  name,
  accept,
  label,
}: {
  name: string;
  accept: string;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [archivos, setArchivos] = useState<File[]>([]);

  function actualizarInput(lista: File[]) {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    lista.forEach((f) => dt.items.add(f));
    inputRef.current.files = dt.files;
    setArchivos(lista);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setArrastrando(false);
    const nuevos = Array.from(e.dataTransfer.files);
    actualizarInput([...archivos, ...nuevos]);
  }

  function handleSeleccion(e: React.ChangeEvent<HTMLInputElement>) {
    setArchivos(Array.from(e.target.files ?? []));
  }

  function quitarArchivo(idx: number) {
    actualizarInput(archivos.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
          arrastrando ? "border-clinica-azul bg-clinica-azulClaro" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <UploadCloud className="mx-auto text-gray-400 mb-1" size={22} />
        <p className="text-xs text-gray-500">
          Arrastra archivos aquí o <span className="text-clinica-azul font-medium">toca para elegir</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          name={name}
          multiple
          accept={accept}
          onChange={handleSeleccion}
          className="hidden"
        />
      </div>

      {archivos.length > 0 && (
        <ul className="mt-2 space-y-1">
          {archivos.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1"
            >
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  quitarArchivo(i);
                }}
                className="text-gray-400 hover:text-red-500 shrink-0 ml-2"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
