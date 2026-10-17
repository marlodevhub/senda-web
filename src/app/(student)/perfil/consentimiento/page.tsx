import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { getStudentSession } from "@/lib/server/session";
import { backendFetch, readJsonSafely } from "@/lib/server/backend";
import type { ConsentContent } from "@/features/access/api/consent";
import { ConsentText } from "@/features/access/components/consent-text";

/** Ayuda e información: el texto del consentimiento vigente, solo para leer (ya lo aceptó en CU-16). */
export default async function LeerConsentimientoPage() {
  const { token } = await getStudentSession();
  if (!token) {
    redirect("/login");
  }
  const response = await backendFetch("/api/v1/consents/current", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const consent = response.ok ? await readJsonSafely<ConsentContent>(response) : null;
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("profile.consentTitle")}</h1>
      {consent ? (
        <>
          <p className="text-sm text-muted-foreground">{t("profile.consentAcceptedVersion", { version: consent.version })}</p>
          <div className="rounded-lg bg-card p-5 shadow-card md:p-8">
            <ConsentText text={consent.text} />
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("common.unexpectedError")}</p>
      )}
      <Button asChild variant="outline" className="self-start">
        <Link href="/perfil">{t("profile.backToProfile")}</Link>
      </Button>
    </div>
  );
}
