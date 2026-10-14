"use client";

import { useTranslations } from "next-intl";

/**
 * Error de un campo de formulario. `message` es siempre una clave de
 * messages/es.json (de un esquema Zod o de un `setError`), nunca texto
 * suelto: así ningún texto de error queda fuera del catálogo.
 */
export function FieldError({ message }: { message?: string }) {
  const t = useTranslations();
  if (!message) {
    return null;
  }
  return (
    <p role="alert" className="text-sm text-destructive">
      {t(message)}
    </p>
  );
}
