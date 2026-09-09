-- Permite que un consentimiento quede "pendiente de firma" (creado por el
-- dentista, esperando que el paciente firme de forma remota), en vez de
-- exigir siempre la firma en el momento de crear el registro.
ALTER TABLE "consentimientos" ALTER COLUMN "firmaImagenPath" DROP NOT NULL;
ALTER TABLE "consentimientos" ALTER COLUMN "fechaFirma" DROP NOT NULL;
ALTER TABLE "consentimientos" ALTER COLUMN "fechaFirma" DROP DEFAULT;

-- Campos para la firma remota por WhatsApp: token de un solo uso con
-- expiración, IP desde donde se firmó, y huella del documento firmado
-- (para poder detectar si algo se alteró después).
ALTER TABLE "consentimientos" ADD COLUMN "token" TEXT;
ALTER TABLE "consentimientos" ADD COLUMN "tokenExpiraEn" TIMESTAMP(3);
ALTER TABLE "consentimientos" ADD COLUMN "ipFirma" TEXT;
ALTER TABLE "consentimientos" ADD COLUMN "hashDocumento" TEXT;

CREATE UNIQUE INDEX "consentimientos_token_key" ON "consentimientos"("token");
