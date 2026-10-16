import type { Gender } from "@/types/gender";

/**
 * Tema de color según el sexo que eligió el estudiante (CU-17/CU-20): "ocean" (azules) para Hombre; Mujer y Otro
 * usan el de siempre. Se guarda en una cookie (no httpOnly: no es secreta) para que el layout raíz lo pinte desde el
 * servidor, sin parpadeo del rosado al azul al cargar.
 */
export type Palette = "ocean";

export const PALETTE_COOKIE = "senda-palette";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function paletteFor(gender: Gender | null | undefined): Palette | undefined {
  return gender === "MALE" ? "ocean" : undefined;
}

/** Lee el valor de la cookie; cualquier otra cosa es el tema de siempre. */
export function parsePalette(value: string | undefined): Palette | undefined {
  return value === "ocean" ? "ocean" : undefined;
}

/** Solo en el navegador: aplica el tema al instante y lo recuerda para la próxima carga. */
export function applyPalette(gender: Gender | null | undefined): void {
  const palette = paletteFor(gender);
  const root = document.documentElement;
  if (palette) {
    root.dataset.palette = palette;
    document.cookie = `${PALETTE_COOKIE}=${palette}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  } else {
    delete root.dataset.palette;
    document.cookie = `${PALETTE_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
}
