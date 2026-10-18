import type { MetadataRoute } from "next";

/**
 * Senda instalable (PWA): con su ícono en la pantalla de inicio del celular o en el escritorio de la laptop, y en su
 * propia ventana, sin la barra del navegador. Abre en la pantalla de arranque (/abrir.html: degradado rojo con el logo
 * blanco), que el service worker (public/sw.js) guarda en el teléfono para que aparezca al instante aunque el servidor
 * tarde, y de ahí pasa a Inicio (si no hay sesión, el proxy lleva al ingreso). background_color es blanco: Android lo
 * usa para el fondo de su arranque y también para la barra de navegación de abajo en toda la app instalada, que debe
 * quedar blanca. theme_color (barra de arriba) queda como estaba. El service worker solo guarda esa pantalla y los
 * archivos de la app: ningún texto del estudiante queda guardado en el dispositivo por instalarla.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Senda",
    short_name: "Senda",
    description: "Un acompañamiento diario para hablarte con más amabilidad.",
    lang: "es",
    start_url: "/abrir.html",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#F2F4EA",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
