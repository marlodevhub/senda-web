"use client";

import { useEffect } from "react";

/**
 * Registra el service worker (public/sw.js) solo en producción: guarda la pantalla de arranque y los archivos de la
 * app para que la app instalada abra al instante. Nunca guarda páginas, respuestas de la API ni textos del estudiante.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Sin service worker la app funciona igual, solo sin el arranque instantáneo.
    });
  }, []);
  return null;
}
