import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getStudentSession } from "@/lib/server/session";
import { backendFetch, readJsonSafely } from "@/lib/server/backend";
import { ConsentView } from "@/features/access/components/consent-view";
import { SendaLogo } from "@/components/brand/senda-logo";
import { Card, CardContent } from "@/components/ui/card";
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
    // Ancho de lectura cómodo (~70 caracteres por línea en escritorio); en móvil ocupa todo el ancho.
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <p className="flex items-center justify-center gap-2 font-heading text-2xl font-extrabold text-foreground">
        <SendaLogo className="size-8 text-(--prompt-red)" />
        Senda
      </p>
      <Card>
        <CardContent className="flex flex-col gap-5 px-5 py-2 md:px-10 md:py-6">
          <h1 className="text-center font-heading text-2xl font-bold text-foreground md:text-3xl">
            {t("consent.title")}
          </h1>
          <ConsentView consent={consent} />
        </CardContent>
      </Card>
    </div>
  );
}
