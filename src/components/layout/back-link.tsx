"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";

/**
 * "‹ Volver", siempre arriba a la izquierda, antes del título, en toda pantalla secundaria (las pestañas principales
 * no lo llevan): el mismo lugar y la misma forma en toda la app, como en una app nativa.
 * - `href`: a dónde va.
 * - `preferHistory`: vuelve a la pantalla anterior si la hay (se llega desde varios lugares); si se abrió directo,
 *   va a `href`.
 */
export function BackLink({ href, preferHistory = false }: { href: string; preferHistory?: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={(event) => {
        if (preferHistory && window.history.length > 1) {
          event.preventDefault();
          router.back();
        }
      }}
      className="-ml-2 flex min-h-11 w-fit touch-manipulation items-center gap-0.5 rounded-full pr-3 pl-1 text-base font-semibold text-bloom-ink transition-colors select-none [-webkit-tap-highlight-color:transparent] hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring active:bg-foreground/8"
    >
      <ChevronLeft className="size-5" aria-hidden />
      {t("common.back")}
    </Link>
  );
}
