import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/server/session";
import { backendFetch, readJsonSafely } from "@/lib/server/backend";
import { WelcomeFlow } from "@/features/welcome/components/welcome-flow";
import type { Welcome } from "@/features/welcome/api/welcome";

/** CU-17: tras el consentimiento (primera vez) o desde "Ver bienvenida" en el perfil. */
export default async function BienvenidaPage() {
  const { token } = await getStudentSession();
  if (!token) {
    redirect("/login");
  }

  const response = await backendFetch("/api/v1/welcome", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const welcome = response.ok ? await readJsonSafely<Welcome>(response) : null;

  return <WelcomeFlow initialStartingPoint={welcome?.startingPoint} />;
}
