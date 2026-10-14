"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/**
 * Error inesperado al mostrar una pantalla: un mensaje amable y la opción de
 * reintentar, sin detalles técnicos (RS-TR-06: nunca se muestran trazas).
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("errors.unexpectedTitle")}</h1>
      <p className="max-w-sm text-base text-muted-foreground">{t("errors.unexpectedBody")}</p>
      <div className="flex gap-2">
        <Button onClick={reset}>{t("errors.retry")}</Button>
        <Button asChild variant="outline">
          <Link href="/inicio">{t("errors.goHome")}</Link>
        </Button>
      </div>
    </main>
  );
}
