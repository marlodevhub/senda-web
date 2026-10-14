import type { MetadataRoute } from "next";

/** App privada de un estudio: no se indexa en buscadores. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
