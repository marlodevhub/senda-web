import type { MetadataRoute } from "next";

/**
 * Senda instalable (PWA): con su ícono en la pantalla de inicio del celular o en el escritorio de la laptop, y en su
 * propia ventana, sin la barra del navegador. Abre en la pantalla de arranque (/abrir.html: degradado rojo con el logo
 * blanco), que el service worker (public/sw.js) guarda en el teléfono para que aparezca al instante aunque el servidor
 * tarde, y de ahí pasa a Inicio (si no hay sesión, el proxy lleva al ingreso). El fondo del arranque del sistema es el
 * mismo rojo. El service worker solo guarda esa pantalla y los archivos de la app: ningún texto del estudiante queda
 * guardado en el dispositivo por instalarla.
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
    background_color: "#9B3558",
    theme_color: "#9B3558",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
