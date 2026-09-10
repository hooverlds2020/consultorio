"use client";

import DienteV2 from "./DienteV2";

const Q1_SUP_DER = [18, 17, 16, 15, 14, 13, 12, 11];
const Q2_SUP_IZQ = [21, 22, 23, 24, 25, 26, 27, 28];
const Q4_INF_DER = [48, 47, 46, 45, 44, 43, 42, 41];
const Q3_INF_IZQ = [31, 32, 33, 34, 35, 36, 37, 38];

function handleClickCara(numero: number, cara: string) {
  // Paso 2: solo visual, todavía no se conecta a base de datos.
  console.log(numero, cara);
}

export default function OdontogramaV2() {
  return (
    <div>
      <h1 className="text-xl font-bold text-clinica-azulOscuro">
        Odontograma - Dentición Permanente
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Click en las caras de cada diente para registrar hallazgos
      </p>

      <div className="border rounded-lg overflow-x-auto">
        {/* Arcada superior */}
        <div className="flex">
          <div className="flex-1 border-r">
            <p className="text-center text-xs text-clinica-azul font-medium py-2">
              Cuadrante 1: Superior Derecho
            </p>
            <div className="flex justify-center gap-2 px-2 pb-4">
              {Q1_SUP_DER.map((n) => (
                <DienteV2 key={n} numero={n} onClickCara={handleClickCara} />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-center text-xs text-clinica-azul font-medium py-2">
              Cuadrante 2: Superior Izquierdo
            </p>
            <div className="flex justify-center gap-2 px-2 pb-4">
              {Q2_SUP_IZQ.map((n) => (
                <DienteV2 key={n} numero={n} onClickCara={handleClickCara} />
              ))}
            </div>
          </div>
        </div>

        {/* Arcada inferior */}
        <div className="flex border-t">
          <div className="flex-1 border-r">
            <p className="text-center text-xs text-clinica-azul font-medium py-2">
              Cuadrante 4: Inferior Derecho
            </p>
            <div className="flex justify-center gap-2 px-2 pb-4">
              {Q4_INF_DER.map((n) => (
                <DienteV2 key={n} numero={n} onClickCara={handleClickCara} />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-center text-xs text-clinica-azul font-medium py-2">
              Cuadrante 3: Inferior Izquierdo
            </p>
            <div className="flex justify-center gap-2 px-2 pb-4">
              {Q3_INF_IZQ.map((n) => (
                <DienteV2 key={n} numero={n} onClickCara={handleClickCara} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
