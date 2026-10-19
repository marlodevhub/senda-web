"use client";

import { Loader2 } from "lucide-react";
import { SendaLogo } from "@/components/brand/senda-logo";

/**
 * Pantalla de carga a pantalla completa mientras se entra (después de aceptar en Google o de una contraseña correcta)
 * hasta que abre la pantalla siguiente: así nunca se vuelve a ver el formulario de ingreso mientras el servidor
 * responde.
 */
export function AuthLoadingOverlay({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background"
    >
      <SendaLogo className="size-16 text-(--prompt-red)" />
      <p className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
        {message}
      </p>
    </div>
  );
}
