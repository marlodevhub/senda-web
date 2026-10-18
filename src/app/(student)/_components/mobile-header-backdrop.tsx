"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Cuánto hay que bajar (px) para que la cabecera tome fondo. */
const SCROLL_THRESHOLD = 8;

/**
 * El fondo de la cabecera del móvil: transparente arriba del todo y, al bajar, el mismo vidrio que el calendario de
 * Inicio (glass-fill y glass-fade-bottom: la opacidad de Perfil → Apariencia, desenfoque y un desvanecido hacia abajo),
 * igual en todas las pantallas aunque cambie su fondo. La transición es suave en los dos sentidos.
 */
export function MobileHeaderBackdrop() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <span
      aria-hidden
      className={cn(
        "glass-fill glass-fade-bottom pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 motion-reduce:transition-none",
        scrolled ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
