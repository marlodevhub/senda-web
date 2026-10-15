import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getStudentSession } from "@/lib/server/session";
import { backendFetch, readJsonSafely } from "@/lib/server/backend";
import { ConsentView } from "@/features/access/components/consent-view";
import type { ConsentContent } from "@/features/access/api/consent";

/**
 * CU-16: se lee directo con el token de la sesión en vez de rebotar por
 * el BFF (`/api/v1/*`) — esto ya corre en el servidor, así que no hace
 * falta un segundo salto HTTP solo para leer el consentimiento vigente.
 */
export default async function ConsentimientoPage() {
  const { token } = await getStudentSession();
  if (!token) {
    redirect("/login");
  }

  const response = await backendFetch("/api/v1/consents/current", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    redirect("/login");
  }

  const consent = await readJsonSafely<ConsentContent>(response);
  if (!consent) {
    redirect("/login");
  }

  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center font-heading text-lg font-semibold text-foreground">{t("consent.title")}</h2>
      <ConsentView consent={consent} />
    </div>
  );
}
