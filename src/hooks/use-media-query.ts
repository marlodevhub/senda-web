"use client";

import { useSyncExternalStore } from "react";

/** `true` si la consulta de medios coincide; en el servidor, `false` (primero móvil). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
