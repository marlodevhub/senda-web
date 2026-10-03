import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/access/components/logout-button";

/**
 * M04 Inicio (CU-05) todavía no se construyó — esta es una pantalla
 * mínima para que el flujo activar/consentimiento/login tenga un
 * destino real y se pueda llegar a Diario, no la pantalla final de CU-05.
 */
export default async function InicioPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">{t("home.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
      </div>
      <Button asChild variant="hero" size="xl">
        <Link href="/diario">{t("home.writeCta")}</Link>
      </Button>
      <LogoutButton />
    </div>
  );
}
