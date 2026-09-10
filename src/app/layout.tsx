import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laboratorio y Consultorio Dental",
  description: "Sistema integral de administración clínica y de laboratorio dental",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
    <html lang="es" className="overflow-x-hidden">
      <body className="overflow-x-hidden w-full">{children}</body>
    </html>
  );
}
