import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/sonner";
import { baloo, figtree, playpen } from "./fonts";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F4EA" },
    { media: "(prefers-color-scheme: dark)", color: "#211C2B" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // El tema de color del estudiante (lib/palette) se pinta desde el servidor: sin parpadeo al cargar.
  const palette = parsePalette((await cookies()).get(PALETTE_COOKIE)?.value);

  return (
    <html
      lang="es"
      data-palette={palette}
      suppressHydrationWarning
      className={`${baloo.variable} ${figtree.variable} ${playpen.variable} antialiased`}
    >
      <body className="min-h-screen">
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Providers>
              {children}
              <Toaster position="bottom-right" richColors />
            </Providers>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
