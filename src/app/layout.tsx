import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { baloo, figtree } from "./fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Senda",
  description: "Un acompañamiento diario para hablarte con más amabilidad.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F4EA" },
    { media: "(prefers-color-scheme: dark)", color: "#211C2B" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${baloo.variable} ${figtree.variable} antialiased`}
    >
      <body className="min-h-screen">
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
