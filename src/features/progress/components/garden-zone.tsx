import { cn } from "@/lib/utils";

export type GardenZoneId = "raices" | "flores" | "ritmo";

const ZONE_CONFIG: Record<
  GardenZoneId,
  { name: string; dimension: string; accent: string; tint: string; ink: string }
> = {
  raices: { name: "Raíces", dimension: "D1 · Errores", accent: "var(--root)", tint: "bg-root-tint", ink: "text-root-ink" },
  flores: { name: "Flores", dimension: "D2 · Valoración", accent: "var(--bloom)", tint: "bg-bloom-tint", ink: "text-bloom-ink" },
  ritmo: { name: "Ritmo", dimension: "D3 · Exigencia", accent: "var(--flow)", tint: "bg-flow-tint", ink: "text-flow-ink" },
};

function ZoneIcon({ zone }: { zone: GardenZoneId }) {
  if (zone === "raices") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5.5">
        <path d="M12 3v7" />
        <path d="M12 10c-3 1-4 3-4 6" />
        <path d="M12 10c3 1 4 3 4 6" />
        <path d="M12 10c-1.5 2-1.5 5 0 8" />
      </svg>
    );
  }
  if (zone === "flores") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5.5">
        <circle cx="12" cy="12" r="2.4" />
        <circle cx="12" cy="6" r="2.4" />
        <circle cx="12" cy="18" r="2.4" />
        <circle cx="6" cy="12" r="2.4" />
        <circle cx="18" cy="12" r="2.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5.5">
      <path d="M3 9c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
      <path d="M3 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
    </svg>
  );
}

/**
 * Fila de una zona del jardín (CU-07): crece con registros y reescrituras,
 * nunca retrocede (RN-PR-04), sin rankings (RN-PR-05). `stage` va de 0 a 5.
 */
export function GardenZone({ zone, stage }: { zone: GardenZoneId; stage: 0 | 1 | 2 | 3 | 4 | 5 }) {
  const cfg = ZONE_CONFIG[zone];
  return (
    <div className="flex items-center gap-3 rounded-md bg-card p-3 shadow-card transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:translate-x-1">
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", cfg.tint, cfg.ink)}>
        <ZoneIcon zone={zone} />
      </div>
      <div>
        <div className={cn("text-sm font-bold", cfg.ink)}>{cfg.name}</div>
        <div className="text-xs text-muted-foreground">
          {cfg.dimension} — etapa {stage}
        </div>
      </div>
      <div className="ml-auto flex gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className="size-1.5 rounded-full"
            style={{ backgroundColor: dot <= stage ? cfg.accent : "var(--border)" }}
          />
        ))}
      </div>
    </div>
  );
}
