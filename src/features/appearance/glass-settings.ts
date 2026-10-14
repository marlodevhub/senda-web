"use client";

import { useSyncExternalStore } from "react";

/**
 * Apariencia del vidrio (barra inferior y botón de mensajes): opacidad,
 * desenfoque y reflejo. Preferencia de este dispositivo: vive en
 * localStorage, nunca en el servidor; si el almacenamiento falla (modo
 * privado, bloqueado) se usan los valores por defecto.
 */
export type GlassSettings = { opacity: number; blur: number; sheen: boolean };

export const GLASS_DEFAULTS: GlassSettings = { opacity: 70, blur: 20, sheen: true };
export const GLASS_LIMITS = { opacity: { min: 40, max: 100, step: 5 }, blur: { min: 0, max: 32, step: 2 } } as const;

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
      blur: clamp(parsed.blur, GLASS_LIMITS.blur.min, GLASS_LIMITS.blur.max, GLASS_DEFAULTS.blur),
      sheen: typeof parsed.sheen === "boolean" ? parsed.sheen : GLASS_DEFAULTS.sheen,
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

/** Las variables CSS que lee la clase `.glass` de globals.css. */
export function glassStyle(settings: GlassSettings): React.CSSProperties {
  return {
    "--glass-alpha": `${settings.opacity}%`,
    "--glass-blur": `${settings.blur}px`,
  } as React.CSSProperties;
}
