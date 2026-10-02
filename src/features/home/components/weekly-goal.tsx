import { cn } from "cn";

/**
 * Meta semanal (RN-DI-08): 3 días con registro por semana, no una racha
 * diaria — "X de 3 días", nunca un porcentaje de mejora (RN-TR-04).
 */
export function WeeklyGoal({
  daysWithEntry,
  goal = 3,
}: {
  daysWithEntry: number;
  goal?: number;
}) {
  const met = daysWithEntry >= goal;
  const pct = Math.min(100, (daysWithEntry / goal) * 100);

  return (
    <div className="rounded-lg bg-card p-3.5 shadow-card">
      <div className="mb-2 flex items-center justify-between text-[0.8125rem] font-semibold text-muted-foreground">
        <span>Meta de la semana</span>
        <span className="tabular-nums">
          {met ? "Cumpliste tu meta" : `${daysWithEntry} de ${goal}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-sprout to-[color-mix(in_oklab,var(--sprout),white_35%)] transition-[width] duration-700 ease-out"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
