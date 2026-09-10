-- ODONTOGRAMA PRO — Paso 1: tablas nuevas y paralelas.
-- No se modifica, renombra ni borra ninguna tabla existente. La tabla
-- "odontogramas" (producción, datos reales) queda intacta.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Catálogo de estados (configurable, empieza con los 20 oficiales)
CREATE TABLE "catalogo_estados_odontograma_v2" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "descripcion" TEXT,
    "color_hex" TEXT NOT NULL,
    "es_sistema" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "catalogo_estados_odontograma_v2_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "catalogo_estados_odontograma_v2_key_key" ON "catalogo_estados_odontograma_v2"("key");

-- 2) Bitácora de hallazgos por cara de diente
CREATE TABLE "odontograma_hallazgos_v2" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pacienteId" TEXT NOT NULL,
    "denticion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diente_fdi" INTEGER NOT NULL,
    "cara" TEXT NOT NULL,
    "estado_key" TEXT NOT NULL,
    "estado_label" TEXT NOT NULL,
    "color_hex" TEXT NOT NULL,
    "cie10_codigo" TEXT,
    "cie10_desc" TEXT,
    "tratamiento_id" TEXT,
    "tratamiento_nombre" TEXT,
    "comentario" TEXT,
    "creado_por" TEXT NOT NULL,

    CONSTRAINT "odontograma_hallazgos_v2_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "odontograma_hallazgos_v2" ADD CONSTRAINT "odontograma_hallazgos_v2_pacienteId_fkey"
  FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "odontograma_hallazgos_v2" ADD CONSTRAINT "odontograma_hallazgos_v2_estado_key_fkey"
  FOREIGN KEY ("estado_key") REFERENCES "catalogo_estados_odontograma_v2"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "odontograma_hallazgos_v2" ADD CONSTRAINT "odontograma_hallazgos_v2_creado_por_fkey"
  FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3) Radiografías del paciente (nueva, no existía antes)
CREATE TABLE "paciente_radiografias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pacienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "pieza" INTEGER,
    "url" TEXT NOT NULL,
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paciente_radiografias_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "paciente_radiografias" ADD CONSTRAINT "paciente_radiografias_pacienteId_fkey"
  FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Siembra de los 20 estados oficiales
INSERT INTO "catalogo_estados_odontograma_v2" ("key", "label", "descripcion", "color_hex") VALUES
  ('caries', 'Caries', NULL, '#ef4444'),
  ('fractura', 'Fractura', 'Ruptura parcial de la corona', '#f97316'),
  ('resto_radicular', 'Resto radicular', 'Solo queda la raíz', '#7f1d1d'),
  ('diente_por_extraer', 'Diente por extraer', 'Indicado para cirugía', '#000000'),
  ('pulpitis_necrosis', 'Pulpitis / Necrosis', 'Afectación del nervio', '#a855f7'),
  ('movilidad', 'Movilidad', 'Grado 1, 2 o 3', '#facc15'),
  ('resina', 'Resina', 'Obturación estética', '#3b82f6'),
  ('amalgama', 'Amalgama', 'Obturación metálica', '#6b7280'),
  ('endodoncia', 'Endodoncia', 'Tratamiento de conductos terminado', '#ec4899'),
  ('corona', 'Corona', 'Prótesis fija individual', '#eab308'),
  ('sujecion_ferula', 'Sujeción / Férula', 'Dientes unidos por ortodoncia o trauma', '#06b6d4'),
  ('sellador', 'Sellador', 'Protección de fosetas y fisuras', '#86efac'),
  ('protesis_fija', 'Prótesis fija (Puente)', 'Dientes pilares y pónticos', '#fde047'),
  ('diente_en_erupcion', 'Diente en erupción', 'Diente saliendo, común en niños', '#93c5fd'),
  ('diente_supernumerario', 'Diente supernumerario', 'Diente extra en la arcada', '#22c55e'),
  ('giroversion', 'Giroversión', 'Diente rotado', '#a3a3a3'),
  ('diente_incluido', 'Diente incluido / Impactado', 'Dentro del hueso', '#52525b'),
  ('diastema', 'Diastema', 'Espacio entre dos dientes', '#ffffff'),
  ('protesis_removible', 'Prótesis removible', 'Aparato que el paciente retira', '#fbbf24'),
  ('ausencia', 'Ausencia', 'Diente perdido anteriormente', '#d1d5db');
