"use client";

import { useTranslations } from "next-intl";
import { Feather, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "GUIDED" | "FREE";

const OPTIONS: { mode: Mode; labelKey: string; icon: typeof Sparkles }[] = [
  { mode: "GUIDED", labelKey: "journal.modeGuided", icon: Sparkles },
  { mode: "FREE", labelKey: "journal.modeFree", icon: Feather },
];

/** RN-DI-02: Guiado (3 preguntas) o Libre, en una píldora. */
export function JournalModeToggle({ value, onChange }: { value: Mode; onChange: (mode: Mode) => void }) {
  const t = useTranslations();

  return (
    <div
      role="radiogroup"
      aria-label={t("journal.title")}
      className="mx-auto flex w-full max-w-sm gap-1 rounded-full bg-card/90 p-1 shadow-card"
    >
      {OPTIONS.map(({ mode, labelKey, icon: Icon }) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(mode)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-base font-semibold transition-all focus-visible:outline-2 focus-visible:outline-ring",
              active
                ? "bg-[linear-gradient(135deg,var(--flow-tint),var(--bloom-tint))] text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
