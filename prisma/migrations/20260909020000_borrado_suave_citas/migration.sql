-- Permite "eliminar" una cita sin perder el registro real (mismo patrón
-- que ya se usa en Pacientes, Historial Clínico, Consentimientos, etc.)
ALTER TABLE "citas" ADD COLUMN "eliminadoEn" TIMESTAMP(3);
