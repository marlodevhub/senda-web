import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/server/session";
import { backendFetch, readJsonSafely } from "@/lib/server/backend";
import { WelcomeFlow } from "@/features/welcome/components/welcome-flow";
import type { Welcome } from "@/features/welcome/api/welcome";

/**
 * CU-17: solo la primera vez, tras el consentimiento o en el primer inicio de
 * sesión (RN-AC-11). Si ya la vio (p. ej. aceptó una versión nueva del
 * consentimiento), va directo a Inicio; para repasarla está /perfil/bienvenida.
 */
export default async function BienvenidaPage() {
  const { token } = await getStudentSession();
  if (!token) {
    redirect("/login");
  }

  const response = await backendFetch("/api/v1/welcome", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const welcome = response.ok ? await readJsonSafely<Welcome>(response) : null;
  if (welcome?.welcomeSeen) {
    redirect("/inicio");
  }

  return <WelcomeFlow initialStartingPoint={welcome?.startingPoint} />;
}
