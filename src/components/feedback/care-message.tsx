import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * RN-ES-11: registro en RIESGO → solo este mensaje neutro. Nada de
 * hallazgos, confirmación ni invitación a reescribir; nadie es
 * notificado (RN-TR-03) — la app solo ofrece los 2 números de siempre.
 * Compartido porque lo usan `analysis` (Espejo en vivo) y `journal`
 * (detalle del historial, CU-11, RN-HI-04).
 */
export function CareMessage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-5 text-center shadow-card">
      <p className="text-base leading-relaxed text-foreground">{t("analysis.care")}</p>
      <div className="flex flex-col gap-2">
        <a
          href="tel:113"
          className="flex items-center justify-center gap-2 rounded-full bg-sprout-tint px-4 py-3 text-sm font-bold text-sprout-ink"
        >
          <Phone className="size-4" aria-hidden />
          {t("analysis.careLine113")}
        </a>
        <a
          href="tel:106"
          className="flex items-center justify-center gap-2 rounded-full bg-sprout-tint px-4 py-3 text-sm font-bold text-sprout-ink"
        >
          <Phone className="size-4" aria-hidden />
          {t("analysis.careSamu106")}
        </a>
      </div>
    </div>
  );
}
