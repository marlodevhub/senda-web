import { getRequestConfig } from "next-intl/server";

/**
 * Senda es monolingüe (español, RN-TR). Sin routing de next-intl (no hay
 * selector de idioma ni prefijo de URL) — solo se usa next-intl como
 * catálogo de textos para que ningún componente tenga español fijo
 * (sección 4 de senda-web/CLAUDE.md).
 */
export default getRequestConfig(async () => ({
  locale: "es",
  messages: (await import("../../messages/es.json")).default,
}));
