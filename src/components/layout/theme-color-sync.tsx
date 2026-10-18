"use client";

import { useEffect } from "react";

/**
 * El color de la barra del sistema en el móvil (y de la ventana de la app instalada) sigue al fondo de la app: el tema
 * (rosado o azul con Hombre) y el modo claro u oscuro elegido en la app, no solo el del sistema. Lee el fondo real de
 * la página y lo copia en las etiquetas `theme-color` cada vez que cambian el tema o el modo en <html>.
 */
export function ThemeColorSync() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const color = getComputedStyle(document.body).backgroundColor;
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
        meta.content = color;
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-palette"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
