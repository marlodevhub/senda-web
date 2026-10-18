import { ThemeColorSync } from "@/components/layout/theme-color-sync";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/sonner";
import { baloo, playpen, roboto } from "./fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import { PALETTE_COOKIE, parsePalette } from "@/lib/palette";
import "./globals.css";

export const metadata: Metadata = {
  title: "Senda",
  description: "Un acompañamiento diario para hablarte con más amabilidad.",
  robots: { index: false, follow: false },
  // Instalada en iPhone/iPad (Compartir → Añadir a pantalla de inicio): ventana propia y su nombre bajo el ícono.
  appleWebApp: { capable: true, title: "Senda", statusBarStyle: "default" },
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
              <Toaster position="bottom-right" richColors />
            </Providers>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
