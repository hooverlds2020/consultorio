import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { rutaPermitida } from "@/lib/permisos";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!rutaPermitida(token.rol, pathname)) {
      // El usuario está logueado pero su rol no puede ver esta ruta
      return NextResponse.redirect(new URL("/panel", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/panel/:path*"],
};
