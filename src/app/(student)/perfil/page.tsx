import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/access/components/logout-button";

/**
 * M08 Perfil (CU-20) todavía no se construyó completo — esta es una
 * pantalla mínima para que CU-21 (retiro) tenga un destino real, no la
 * pantalla final de CU-20.
 */
export default async function PerfilPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("profile.title")}</h1>
      <LogoutButton />
      <Button asChild variant="outline">
        <Link href="/perfil/retiro">{t("profile.withdrawCta")}</Link>
      </Button>
    </div>
  );
}
