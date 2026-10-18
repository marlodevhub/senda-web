"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Apariencia de este dispositivo: el vidrio de toda la app (opacidad y línea de luz; el desenfoque es fijo, 16 px,
 * en globals.css) y si se muestran las barras de desplazamiento (por defecto, no). Preferencia de este dispositivo: vive en
 * localStorage, nunca en el servidor; si el almacenamiento falla (modo
 * privado, bloqueado) se usan los valores por defecto.
 */
export type GlassSettings = { opacity: number; sheen: boolean; scrollbars: boolean };

export const GLASS_DEFAULTS: GlassSettings = { opacity: 70, sheen: true, scrollbars: false };
export const GLASS_LIMITS = { opacity: { min: 40, max: 100, step: 5 } } as const;

const STORAGE_KEY = "senda.glass";
const CHANGE_EVENT = "senda:glass-change";

let cachedRaw: string | null | undefined;
let cachedSettings: GlassSettings = GLASS_DEFAULTS;

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function read(): GlassSettings {
  const raw = readRaw();
  if (raw === cachedRaw) {
    return cachedSettings;
  }
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<GlassSettings>) : {};
    cachedSettings = {
      opacity: clamp(parsed.opacity, GLASS_LIMITS.opacity.min, GLASS_LIMITS.opacity.max, GLASS_DEFAULTS.opacity),
      sheen: typeof parsed.sheen === "boolean" ? parsed.sheen : GLASS_DEFAULTS.sheen,
      scrollbars: typeof parsed.scrollbars === "boolean" ? parsed.scrollbars : GLASS_DEFAULTS.scrollbars,
    };
  } catch {
    cachedSettings = GLASS_DEFAULTS;
  }
  return cachedSettings;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useGlassSettings(): GlassSettings {
  return useSyncExternalStore(subscribe, read, () => GLASS_DEFAULTS);
}

export function saveGlassSettings(settings: GlassSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Sin almacenamiento: el cambio se ve en esta página, pero no se recuerda.
    cachedRaw = JSON.stringify(settings);
    cachedSettings = settings;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Aplica la opacidad elegida a todo el vidrio de la app: `--glass-alpha` en <html>, que leen `--glass-bg` y las
 * clases de vidrio de globals.css (un solo vidrio para toda la app).
 */
export function useApplyGlassSettings() {
  const settings = useGlassSettings();
  useEffect(() => {
    document.documentElement.style.setProperty("--glass-alpha", `${settings.opacity}%`);
  }, [settings.opacity]);
  // Las barras de desplazamiento se ocultan por defecto (globals.css); esta clase las vuelve a mostrar.
  useEffect(() => {
    document.documentElement.classList.toggle("show-scrollbars", settings.scrollbars);
  }, [settings.scrollbars]);
}
