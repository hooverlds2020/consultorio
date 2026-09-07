import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const CARPETA_UPLOADS = path.join(process.cwd(), "public", "uploads");

const TIPOS_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Evita path traversal (../../etc) uniendo y normalizando, y verificando
  // que el resultado siga dentro de la carpeta de uploads.
  const rutaSolicitada = path.normalize(path.join(CARPETA_UPLOADS, ...params.path));

  if (!rutaSolicitada.startsWith(CARPETA_UPLOADS)) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  try {
    const info = await stat(rutaSolicitada);
    if (!info.isFile()) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const bytes = await readFile(rutaSolicitada);
    const extension = path.extname(rutaSolicitada).toLowerCase();
    const tipoMime = TIPOS_MIME[extension] ?? "application/octet-stream";

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": tipoMime,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
