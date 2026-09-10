import { obtenerLogoNegocio } from "@/actions/marca";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const logoUrl = (await obtenerLogoNegocio()) ?? "/logo-cesar-oficial.png";
  return <LoginForm logoUrl={logoUrl} />;
}
