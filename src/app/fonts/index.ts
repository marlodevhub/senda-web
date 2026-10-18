import localFont from "next/font/local";

export const baloo = localFont({
  src: [
    { path: "./Baloo2-700.woff2", weight: "700", style: "normal" },
    { path: "./Baloo2-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-baloo",
  display: "swap",
});

/**
 * La letra del sistema: Roboto, fuente variable (pesos 100 a 900 en un solo archivo, subconjunto latino, que incluye
 * las tildes, la ñ y los signos ¿ ¡ del español). Licencia SIL Open Font License.
 */
export const roboto = localFont({
  src: [{ path: "./Roboto-Variable.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-roboto",
  display: "swap",
});

/** Diario: letra manuscrita redondeada y muy legible para las preguntas y lo que escribe el estudiante. OFL. */
export const playpen = localFont({
  src: [
    { path: "./PlaypenSansThai-400.woff2", weight: "400", style: "normal" },
    { path: "./PlaypenSansThai-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-playpen",
  display: "swap",
});
