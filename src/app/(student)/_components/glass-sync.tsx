"use client";

import { useApplyGlassSettings } from "@/features/appearance/glass-settings";

/** Pone la opacidad del vidrio elegida en Perfil → Apariencia en <html>: todo el vidrio de la app la usa. */
export function GlassSync() {
  useApplyGlassSettings();
  return null;
}
