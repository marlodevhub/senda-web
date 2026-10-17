"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";

/** El evento que Chrome, Edge y Android lanzan cuando la app se puede instalar (no está en los tipos del DOM). */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Cómo se instala Senda en este navegador:
 * - `prompt`: Chrome, Edge o Android ofrecen su ventana de instalación (`install()` la abre).
 * - `ios`: Safari de iPhone/iPad no tiene esa ventana; se explica "Compartir → Añadir a pantalla de inicio".
 * - `installed`: ya se abrió como app instalada.
 * - `unavailable`: el navegador no la instala (p. ej. Firefox de escritorio) o todavía no lo ofreció.
 */
export type InstallState = "prompt" | "ios" | "installed" | "unavailable";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  // iPadOS se presenta como Mac: se reconoce por la pantalla táctil.
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function useInstallApp(): { state: InstallState; install: () => Promise<void> } {
  const mounted = useMounted();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      // Sin la barra automática del navegador: se instala desde el botón de Senda.
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // El evento sirve una sola vez: si no la instaló, el navegador lo vuelve a ofrecer más adelante.
    setPromptEvent(null);
    setInstalled(outcome === "accepted");
  }

  // Lo del navegador (instalada, iPhone) solo se sabe en el cliente: antes de montar, nada.
  const state: InstallState = !mounted
    ? "unavailable"
    : installed || isStandalone()
      ? "installed"
      : promptEvent
        ? "prompt"
        : isIos()
          ? "ios"
          : "unavailable";

  return { state, install };
}
