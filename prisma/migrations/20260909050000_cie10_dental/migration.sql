-- Catálogo CIE-10 acotado a capítulos dentales (K00-K08 + S02.5).
-- Compilado de la clasificación CIE-10 estándar (información médica
-- pública y estable) — no es una importación literal del archivo
-- oficial de la DGIS/CEMECE. Recomendado cotejar contra el archivo
-- oficial si se requiere para una auditoría NOM-024.

CREATE TABLE "cie10_diagnosticos_v2" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "capitulo" TEXT,
    "grupo" TEXT,

    CONSTRAINT "cie10_diagnosticos_v2_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cie10_diagnosticos_v2_codigo_key" ON "cie10_diagnosticos_v2"("codigo");
CREATE INDEX "cie10_diagnosticos_v2_descripcion_idx" ON "cie10_diagnosticos_v2"("descripcion");

INSERT INTO "cie10_diagnosticos_v2" ("codigo", "descripcion", "grupo") VALUES
  ('K00.0', 'Anodoncia', 'K00 Trastornos del desarrollo y erupción de los dientes'),
  ('K00.1', 'Dientes supernumerarios', 'K00 Trastornos del desarrollo y erupción de los dientes'),
  ('K00.2', 'Anomalías del tamaño y la forma de los dientes', 'K00 Trastornos del desarrollo y erupción de los dientes'),
  ('K00.3', 'Dientes moteados', 'K00 Trastornos del desarrollo y erupción de los dientes'),
  ('K00.4', 'Trastornos de la formación dentaria', 'K00 Trastornos del desarrollo y erupción de los dientes'),
  ('K00.6', 'Trastornos de la erupción dentaria', 'K00 Trastornos del desarrollo y erupción de los dientes'),
  ('K00.7', 'Síndrome de la erupción dentaria', 'K00 Trastornos del desarrollo y erupción de los dientes'),
  ('K00.8', 'Otros trastornos del desarrollo de los dientes', 'K00 Trastornos del desarrollo y erupción de los dientes'),
  ('K00.9', 'Trastorno del desarrollo de los dientes, no especificado', 'K00 Trastornos del desarrollo y erupción de los dientes'),

  ('K01.0', 'Dientes incluidos', 'K01 Dientes incluidos e impactados'),
  ('K01.1', 'Dientes impactados', 'K01 Dientes incluidos e impactados'),

  ('K02.0', 'Caries limitada al esmalte', 'K02 Caries dental'),
  ('K02.1', 'Caries de la dentina', 'K02 Caries dental'),
  ('K02.2', 'Caries del cemento', 'K02 Caries dental'),
  ('K02.3', 'Caries dental detenida', 'K02 Caries dental'),
  ('K02.4', 'Odontoclasia', 'K02 Caries dental'),
  ('K02.5', 'Caries con exposición de la pulpa', 'K02 Caries dental'),
  ('K02.8', 'Otras caries dentales', 'K02 Caries dental'),
  ('K02.9', 'Caries dental, no especificada', 'K02 Caries dental'),

  ('K03.0', 'Atrición excesiva de los dientes', 'K03 Otras enfermedades de los tejidos duros de los dientes'),
  ('K03.1', 'Abrasión de los dientes', 'K03 Otras enfermedades de los tejidos duros de los dientes'),
  ('K03.2', 'Erosión de los dientes', 'K03 Otras enfermedades de los tejidos duros de los dientes'),
  ('K03.3', 'Reabsorción patológica de los dientes', 'K03 Otras enfermedades de los tejidos duros de los dientes'),
  ('K03.4', 'Hipercementosis', 'K03 Otras enfermedades de los tejidos duros de los dientes'),
  ('K03.5', 'Anquilosis dental', 'K03 Otras enfermedades de los tejidos duros de los dientes'),
  ('K03.6', 'Depósitos [acreciones] en los dientes', 'K03 Otras enfermedades de los tejidos duros de los dientes'),
  ('K03.7', 'Cambios de color post-eruptivos de los tejidos duros de los dientes', 'K03 Otras enfermedades de los tejidos duros de los dientes'),
  ('K03.9', 'Enfermedad de los tejidos duros de los dientes, no especificada', 'K03 Otras enfermedades de los tejidos duros de los dientes'),

  ('K04.0', 'Pulpitis', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),
  ('K04.1', 'Necrosis de la pulpa', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),
  ('K04.2', 'Degeneración de la pulpa', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),
  ('K04.3', 'Formación anormal de tejido duro en la pulpa', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),
  ('K04.4', 'Periodontitis apical aguda originada en la pulpa', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),
  ('K04.5', 'Periodontitis apical crónica', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),
  ('K04.6', 'Absceso periapical con fístula', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),
  ('K04.7', 'Absceso periapical sin fístula', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),
  ('K04.8', 'Quiste radicular', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),
  ('K04.9', 'Otras enfermedades de la pulpa y tejidos periapicales, no especificadas', 'K04 Enfermedades de la pulpa y de los tejidos periapicales'),

  ('K05.0', 'Gingivitis aguda', 'K05 Gingivitis y enfermedades periodontales'),
  ('K05.1', 'Gingivitis crónica', 'K05 Gingivitis y enfermedades periodontales'),
  ('K05.2', 'Periodontitis aguda', 'K05 Gingivitis y enfermedades periodontales'),
  ('K05.3', 'Periodontitis crónica', 'K05 Gingivitis y enfermedades periodontales'),
  ('K05.4', 'Periodontosis', 'K05 Gingivitis y enfermedades periodontales'),
  ('K05.5', 'Otras enfermedades periodontales', 'K05 Gingivitis y enfermedades periodontales'),
  ('K05.6', 'Enfermedad periodontal, no especificada', 'K05 Gingivitis y enfermedades periodontales'),

  ('K06.0', 'Retracción gingival', 'K06 Otros trastornos de la encía y del reborde alveolar edéntulo'),
  ('K06.1', 'Hiperplasia gingival', 'K06 Otros trastornos de la encía y del reborde alveolar edéntulo'),
  ('K06.2', 'Lesiones de la encía y reborde alveolar por traumatismo', 'K06 Otros trastornos de la encía y del reborde alveolar edéntulo'),
  ('K06.9', 'Trastorno de la encía y reborde alveolar edéntulo, no especificado', 'K06 Otros trastornos de la encía y del reborde alveolar edéntulo'),

  ('K07.0', 'Anomalías importantes del tamaño de los maxilares', 'K07 Anomalías dentofaciales'),
  ('K07.1', 'Anomalías de la relación maxilobasilar', 'K07 Anomalías dentofaciales'),
  ('K07.2', 'Anomalías de la relación entre los arcos dentarios', 'K07 Anomalías dentofaciales'),
  ('K07.3', 'Anomalías de la posición de los dientes', 'K07 Anomalías dentofaciales'),
  ('K07.4', 'Maloclusión, no especificada', 'K07 Anomalías dentofaciales'),
  ('K07.5', 'Anomalías dentofaciales funcionales', 'K07 Anomalías dentofaciales'),
  ('K07.6', 'Trastornos de la articulación temporomandibular', 'K07 Anomalías dentofaciales'),
  ('K07.9', 'Anomalía dentofacial, no especificada', 'K07 Anomalías dentofaciales'),

  ('K08.0', 'Exfoliación de los dientes debida a causas sistémicas', 'K08 Otros trastornos de los dientes y sus estructuras de sostén'),
  ('K08.1', 'Pérdida de dientes por accidente, extracción o enfermedad periodontal', 'K08 Otros trastornos de los dientes y sus estructuras de sostén'),
  ('K08.2', 'Atrofia del reborde alveolar edéntulo', 'K08 Otros trastornos de los dientes y sus estructuras de sostén'),
  ('K08.3', 'Raíz dental retenida', 'K08 Otros trastornos de los dientes y sus estructuras de sostén'),
  ('K08.9', 'Trastorno de los dientes y sus estructuras de sostén, no especificado', 'K08 Otros trastornos de los dientes y sus estructuras de sostén'),

  ('S02.5', 'Fractura de diente', 'S02 Fractura de huesos del cráneo y de la cara');
