"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Cuánto hay que bajar (px) para que la cabecera tome fondo. */
const SCROLL_THRESHOLD = 8;

/**
 * El fondo de la cabecera del móvil: transparente arriba del todo y, al bajar, vidrio teñido con los colores de arriba
 * de esa pantalla (`.screen-top-backdrop`: el color de fondo, el cielo del Jardín o el del Diario). El vidrio es el de
 * toda la app: el mismo desenfoque y la opacidad de Perfil → Apariencia (`--glass-filter`, `--glass-alpha`), y se
 * desvanece hacia abajo para que el contenido pase por detrás sin corte. La transición es suave en los dos sentidos.
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
        "pointer-events-none absolute inset-x-0 top-0 -bottom-6 -z-10 [backdrop-filter:var(--glass-filter)] [-webkit-backdrop-filter:var(--glass-filter)] transition-opacity duration-300 [mask-image:linear-gradient(to_bottom,black_0%,rgb(0_0_0/0.9)_40%,rgb(0_0_0/0.45)_72%,transparent_100%)] motion-reduce:transition-none",
        scrolled ? "opacity-100" : "opacity-0",
      )}
    >
      <span className="screen-top-backdrop absolute inset-0 [opacity:var(--glass-alpha,70%)]" />
    </span>
  );
}
