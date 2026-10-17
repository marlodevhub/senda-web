"use client";

import { useTranslations } from "next-intl";
import { Check, Loader2, X } from "lucide-react";
import type { UsernameAvailabilityState } from "@/hooks/use-username-availability";
import { cn } from "@/lib/utils";

/**
 * El indicador dentro del campo de usuario (a la derecha): girando mientras se comprueba, check verde si está libre,
 * X roja si está ocupado. Va encima del input (que reserva espacio con `pr-12`).
 */
export function UsernameAvailabilityIcon({ state }: { state: UsernameAvailabilityState }) {
  if (state === "idle") {
    return null;
  }
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full",
        state === "available" && "bg-sprout text-sprout-foreground",
        state === "taken" && "bg-destructive text-white",
        state === "checking" && "text-muted-foreground",
      )}
    >
      {state === "checking" && <Loader2 className="size-4 animate-spin" />}
      {state === "available" && <Check className="size-4" strokeWidth={3} />}
      {state === "taken" && <X className="size-4" strokeWidth={3} />}
    </span>
  );
}

/** El mismo resultado en texto, para lectores de pantalla y para quien no distingue colores. */
export function UsernameAvailabilityMessage({ state, id }: { state: UsernameAvailabilityState; id?: string }) {
  const t = useTranslations();
  return (
    <p
      id={id}
      aria-live="polite"
      className={cn(
        "text-base",
        state === "available" && "font-semibold text-sprout-ink",
        state === "taken" && "font-semibold text-[#A83A2F] dark:text-destructive",
        (state === "idle" || state === "checking") && "sr-only",
      )}
    >
      {state === "available" && t("access.usernameAvailable")}
      {state === "taken" && t("access.usernameTaken")}
      {state === "checking" && t("access.usernameChecking")}
    </p>
  );
}
