-- Cuánto cobra el laboratorio externo por el trabajo, y cuánto ya se le
-- pagó — para poder ver de un vistazo cuánto se le debe en total.
ALTER TABLE "ordenes_laboratorio" ADD COLUMN "costoLaboratorio" DECIMAL(10,2);
ALTER TABLE "ordenes_laboratorio" ADD COLUMN "anticipoLaboratorio" DECIMAL(10,2);
