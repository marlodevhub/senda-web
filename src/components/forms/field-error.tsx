"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Error de un campo de formulario. `message` es siempre una clave de
 * messages/es.json (de un esquema Zod o de un `setError`), nunca texto
 * suelto: así ningún texto de error queda fuera del catálogo.
 */
export function FieldError({ message, className }: { message?: string; className?: string }) {
  const t = useTranslations();
  if (!message) {
    return null;
  }
  return (
    <p role="alert" className={cn("text-base text-destructive", className)}>
      {t(message)}
    </p>
  );
}
