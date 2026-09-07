import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laboratorio y Consultorio Dental",
  description: "Sistema integral de administración clínica y de laboratorio dental",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}
