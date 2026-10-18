"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Share, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallApp } from "@/components/pwa/use-install-app";
import { cn } from "@/lib/utils";

/**
 * "Instalar Senda": con su ícono en el celular o la laptop. En Chrome, Edge y Android abre la ventana de instalación
 * del sistema; en iPhone/iPad explica el paso en Safari. No aparece si ya está instalada o si el navegador no la
 * instala.
 */
export function InstallApp({ intro = false, className }: { intro?: boolean; className?: string }) {
  const t = useTranslations();
  const { state, install } = useInstallApp();
  const [showIosSteps, setShowIosSteps] = useState(false);

  if (state === "installed" || state === "unavailable") {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* `intro`: como tarjeta de Perfil, con su título y para qué sirve. */}
      {intro && (
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-base font-semibold text-foreground">{t("install.title")}</h2>
          <p className="text-base text-muted-foreground">{t("install.hint")}</p>
        </div>
      )}
      {/* Verde sólido de descarga, igual en todos los temas y modos (blanco sobre verde: 5:1). */}
      <Button
        type="button"
        className="rounded-full bg-green-700 text-white hover:bg-green-800"
        aria-expanded={state === "ios" ? showIosSteps : undefined}
        onClick={() => (state === "prompt" ? void install() : setShowIosSteps((open) => !open))}
      >
        <Download className="size-4" aria-hidden />
        {t("install.cta")}
      </Button>
      {state === "ios" && showIosSteps && (
        <ol className="flex flex-col gap-2 rounded-2xl bg-foreground/5 p-4 text-base text-foreground">
          <li className="flex items-center gap-2">
            <Share className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            {t("install.iosStep1")}
          </li>
          <li className="flex items-center gap-2">
            <SquarePlus className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            {t("install.iosStep2")}
          </li>
        </ol>
      )}
    </div>
  );
}
