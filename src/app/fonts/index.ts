import localFont from "next/font/local";

export const baloo = localFont({
  src: [
    { path: "./Baloo2-700.woff2", weight: "700", style: "normal" },
    { path: "./Baloo2-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-baloo",
  display: "swap",
});

export const figtree = localFont({
  src: [
    { path: "./Figtree-400.woff2", weight: "400", style: "normal" },
    { path: "./Figtree-600.woff2", weight: "600", style: "normal" },
    { path: "./Figtree-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-figtree",
  display: "swap",
});
