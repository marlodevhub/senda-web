import type { CSSProperties } from "react";
import type { Illustration } from "@/features/welcome/illustrations/undraw";

/**
 * Pinta una ilustración (unDraw o del mismo estilo) con los colores de la pantalla: su acento en `accent` y el
 * secundario en `accent2`. El SVG es estático, del propio repositorio (sin scripts ni eventos): por eso va en línea.
 * Decorativa.
 */
export function IllustrationArt({
  art,
  accent,
  accent2,
  className,
}: {
  art: Illustration;
  accent: string;
  accent2: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={art.viewBox}
      aria-hidden
      focusable="false"
      className={className}
      style={{ "--illu-accent": accent, "--illu-accent-2": accent2 } as CSSProperties}
      dangerouslySetInnerHTML={{ __html: art.markup }}
    />
  );
}
