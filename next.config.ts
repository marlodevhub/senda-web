import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const isProduction = process.env.NODE_ENV === "production";

/**
 * Política de contenido: todo sale de este mismo origen (el navegador nunca
 * llama a senda-api ni al proveedor de LLM, solo al BFF); la única excepción es el
 * botón de Google, y solo si está configurado (NEXT_PUBLIC_GOOGLE_CLIENT_ID). 'unsafe-inline' en
 * scripts lo necesitan los scripts de arranque de Next y de next-themes;
 * 'unsafe-eval' solo en desarrollo (recarga en caliente).
 */
// CU-18/CU-20: con el ingreso con Google activo, su script, su botón (iframe) y sus estilos vienen de accounts.google.com.
const googleSignIn = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());
const gis = googleSignIn ? " https://accounts.google.com/gsi/" : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}${googleSignIn ? " https://accounts.google.com/gsi/client" : ""}`,
  `style-src 'self' 'unsafe-inline'${gis}`,
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${gis}`,
  ...(googleSignIn ? ["frame-src https://accounts.google.com/gsi/"] : []),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // El inicio de sesión de Google abre una ventana de Google: necesita "allow-popups" (recomendación de Google).
  { key: "Cross-Origin-Opener-Policy", value: googleSignIn ? "same-origin-allow-popups" : "same-origin" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  // RS-TR-01: solo HTTPS una vez desplegado (en local se trabaja con http://localhost).
  ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  // Sin el botón flotante "N" de Next.js en desarrollo (los errores siguen saliendo en su panel al ocurrir).
  devIndicators: false,
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    // Navegación instantánea entre pestañas: una pantalla ya visitada (o precargada desde la barra) se reusa 5 minutos
    // sin volver a pedirla al servidor. Las pantallas solo traen su estructura; los datos del estudiante llegan aparte
    // por TanStack Query, que los refresca solo.
    staleTimes: { dynamic: 300 },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
