import type { MetadataRoute } from "next";

/**
 * Senda instalable (PWA): con su ícono en la pantalla de inicio del celular o en el escritorio de la laptop, y en su
 * propia ventana, sin la barra del navegador. Abre en Inicio (si no hay sesión, el proxy lleva al ingreso). No hay
 * service worker ni caché sin conexión: ningún texto del estudiante queda guardado en el dispositivo por instalarla.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Senda",
    short_name: "Senda",
    description: "Un acompañamiento diario para hablarte con más amabilidad.",
    lang: "es",
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    background_color: "#F2F4EA",
    theme_color: "#F2F4EA",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
