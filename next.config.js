/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "odontologia.clicknube.site",
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Los archivos subidos por usuarios (radiografías, firmas, galería)
        // se sirven vía Route Handler dinámico, no por el servidor estático
        // de Next — porque en modo standalone Next cachea en memoria la
        // lista de archivos de /public al arrancar, y no detecta archivos
        // agregados después (subidas en tiempo de ejecución).
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
