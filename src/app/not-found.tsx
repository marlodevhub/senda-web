import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

/** Enlace roto o registro que ya no existe (RS-TR: 404 sin revelar si existió). */
export default async function NotFound() {
  const t = await getTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("errors.notFoundTitle")}</h1>
      <p className="max-w-sm text-base text-muted-foreground">{t("errors.notFoundBody")}</p>
      <Button asChild variant="hero" size="lg">
        <Link href="/inicio">{t("errors.goHome")}</Link>
      </Button>
    </main>
  );
}
