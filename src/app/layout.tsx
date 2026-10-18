import { ThemeColorSync } from "@/components/layout/theme-color-sync";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/sonner";
import { baloo, playpen, roboto } from "./fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import { PALETTE_COOKIE, parsePalette } from "@/lib/palette";
import "./globals.css";

/**
 * Arranque de la app instalada en iPhone/iPad: la misma pantalla que /abrir.html (degradado rojo con el logotipo y
 * "Senda" en el centro), una imagen por tamaño de pantalla en public/splash/ ([ancho CSS, alto CSS, densidad]). Así el
 * sistema muestra el splash desde el primer instante y no se nota el paso a la página.
 */
const APPLE_SPLASH_SCREENS: [number, number, number][] = [
  [440, 956, 3],
  [402, 874, 3],
  [430, 932, 3],
  [393, 852, 3],
  [428, 926, 3],
  [390, 844, 3],
  [375, 812, 3],
  [414, 896, 3],
  [414, 896, 2],
  [414, 736, 3],
  [375, 667, 2],
  [320, 568, 2],
  [1024, 1366, 2],
  [834, 1194, 2],
  [820, 1180, 2],
  [810, 1080, 2],
  [768, 1024, 2],
];

export const metadata: Metadata = {
  title: "Senda",
  description: "Un acompañamiento diario para hablarte con más amabilidad.",
  robots: { index: false, follow: false },
  // Instalada en iPhone/iPad (Compartir → Añadir a pantalla de inicio): ventana propia y su nombre bajo el ícono.
  appleWebApp: {
    capable: true,
    title: "Senda",
    statusBarStyle: "default",
    startupImage: APPLE_SPLASH_SCREENS.map(([width, height, ratio]) => ({
      url: `/splash/apple-splash-${width * ratio}x${height * ratio}.jpg`,
      media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
    })),
  },
};

/** El fondo de cada tema, claro y oscuro (los `--paper` de globals.css), para la barra del sistema. */
const THEME_COLORS = {
  ocean: { light: "#E6ECF5", dark: "#1B2838" },
  default: { light: "#F2F4EA", dark: "#211C2B" },
} as const;

/**
 * La barra del sistema toma el fondo del tema desde el servidor (cookie del tema); ThemeColorSync la corrige si el
 * estudiante eligió en la app otro modo que el del sistema.
 */
export async function generateViewport(): Promise<Viewport> {
  const palette = parsePalette((await cookies()).get(PALETTE_COOKIE)?.value);
  const colors = palette === "ocean" ? THEME_COLORS.ocean : THEME_COLORS.default;
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: colors.light },
      { media: "(prefers-color-scheme: dark)", color: colors.dark },
    ],
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // El tema de color del estudiante (lib/palette) se pinta desde el servidor: sin parpadeo al cargar.
  const palette = parsePalette((await cookies()).get(PALETTE_COOKIE)?.value);

  return (
    <html
      lang="es"
      data-palette={palette}
      suppressHydrationWarning
      className={`${baloo.variable} ${roboto.variable} ${playpen.variable} antialiased`}
    >
      <body className="min-h-screen">
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Providers>
              {children}
              <ThemeColorSync />
              <ServiceWorkerRegister />
              <Toaster position="bottom-right" richColors />
            </Providers>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
