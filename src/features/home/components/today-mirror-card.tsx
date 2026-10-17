"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ScanFace } from "lucide-react";
import type { HomeTodayEntry } from "@/features/home/api/get-home";
import { routes } from "@/lib/routes";

/**
 * CU-05: si hoy escribió, un acceso a su Espejo de hoy (CU-03) con lo que notó, en lenguaje neutro: cuántas frases,
 * que todavía lo está leyendo, o solo "Ver tu espejo" (sin hallazgos, no se pudo leer o mensaje de cuidado). Nunca
 * nombra el riesgo (RN-ES-11).
 */
export function TodayMirrorCard({ entry }: { entry: HomeTodayEntry }) {
  const t = useTranslations();
  const summary =
    entry.analysisStatus === "PENDING"
      ? t("home.todayMirrorPending")
      : entry.analysisStatus === "COMPLETED" && entry.findingsCount > 0
        ? t("home.todayMirrorFindings", { count: entry.findingsCount })
        : t("home.todayMirrorSeen");

  return (
    <Link
      href={routes.mirror(entry.journalEntryId)}
      className="group flex items-center gap-4 rounded-lg bg-card p-4 shadow-card transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring motion-reduce:hover:translate-y-0"
    >
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-celeste text-bloom-ink"
      >
        <ScanFace className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-heading text-lg font-bold text-foreground">{t("home.todayMirrorTitle")}</span>
        <span className="text-base text-muted-foreground">{summary}</span>
      </span>
      <ArrowRight
        aria-hidden
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
