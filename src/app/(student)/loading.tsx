import { Loader2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * Mientras llega una pantalla que todavía no está precargada, se muestra esto al instante (la barra y el encabezado
 * siguen en su lugar), en vez de quedarse en la pantalla anterior sin responder.
 */
export default async function StudentLoading() {
  const t = await getTranslations();
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center" role="status">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
    </div>
  );
}
