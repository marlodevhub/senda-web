"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Cuánto hay que bajar (px) para que la cabecera tome fondo. */
const SCROLL_THRESHOLD = 8;

/**
 * El fondo de la cabecera del móvil: transparente arriba del todo y, al bajar, el color de fondo con desenfoque que
 * se desvanece hacia abajo (el contenido pasa por detrás sin corte). La transición es suave en los dos sentidos.
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
        "pointer-events-none absolute inset-x-0 top-0 -bottom-6 -z-10 bg-background/85 backdrop-blur-xl transition-opacity duration-300 [mask-image:linear-gradient(to_bottom,black_0%,rgb(0_0_0/0.9)_40%,rgb(0_0_0/0.45)_72%,transparent_100%)] motion-reduce:transition-none",
        scrolled ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
