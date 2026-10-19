"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Script from "next/script";
import { GOOGLE_CLIENT_ID, isGoogleSignInEnabled } from "@/config/public-env";

const GIS_SRC = "https://accounts.google.com/gsi/client";
/**
 * El botón más grande de Google mide 40 px de alto; los campos de Senda, 48 px. Se dibuja más angosto y se agranda
 * con `scale` para quedar del mismo alto que los campos y del ancho exacto del formulario.
 */
const GIS_HEIGHT = 40;
const TARGET_HEIGHT = 48;
const SCALE = TARGET_HEIGHT / GIS_HEIGHT;
// Google acepta de 200 a 400 px de ancho.
const GIS_MIN_WIDTH = 200;
const GIS_MAX_WIDTH = 400;

type CredentialResponse = { credential?: string };

type GoogleAccountsId = {
  initialize(options: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    use_fedcm_for_button?: boolean;
    context?: "signin" | "use";
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "large";
      text: "signin_with" | "continue_with";
      shape: "pill";
      locale: string;
      width: number;
    },
  ): void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

/**
 * Botón oficial de Google Identity Services (CU-18 "Ingresar con Google", CU-20 vincular). Entrega a `onCredential`
 * el ID token que firmó Google; nunca se pide el correo, el nombre ni la foto (senda-api solo guarda un HMAC del
 * identificador). Si el client ID no está configurado, no se muestra nada.
 */
export function GoogleSignInButton({
  onCredential,
  text = "signin_with",
}: {
  onCredential: (idToken: string) => void;
  text?: "signin_with" | "continue_with";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  // El ancho disponible: se vuelve a medir si cambia (rotar el teléfono, abrir el teclado), así nunca desborda.
  const [availableWidth, setAvailableWidth] = useState(0);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.accounts),
  );
  const handleCredential = useEffectEvent((response: CredentialResponse) => {
    if (response.credential) {
      onCredential(response.credential);
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(Math.floor(entry.contentRect.width)));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    const gis = window.google?.accounts.id;
    if (!scriptReady || !button || !gis || availableWidth === 0) {
      return;
    }
    gis.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => handleCredential(response),
      use_fedcm_for_button: true,
      context: "signin",
    });
    button.replaceChildren();
    gis.renderButton(button, {
      type: "standard",
      // Siempre el botón blanco de Google, también en modo oscuro.
      theme: "outline",
      size: "large",
      text,
      shape: "pill",
      locale: "es",
      width: buttonWidth(availableWidth),
    });
  }, [scriptReady, text, availableWidth]);

  if (!isGoogleSignInEnabled) {
    return null;
  }

  return (
    <>
      <Script src={GIS_SRC} strategy="afterInteractive" onReady={() => setScriptReady(true)} />
      {/*
        min-w-0 y overflow-hidden: el botón de Google nunca ensancha el formulario. color-scheme light: el botón de
        Google vive en un iframe claro; si la página está en modo oscuro, el navegador le pone un fondo blanco opaco
        (las esquinas blancas). Con el mismo esquema, el fondo del iframe queda transparente.
      */}
      <div
        ref={containerRef}
        className="flex h-12 w-full min-w-0 justify-center overflow-hidden rounded-full [color-scheme:light]"
      >
        <div
          ref={buttonRef}
          style={{ width: buttonWidth(availableWidth), transform: `scale(${SCALE})`, transformOrigin: "top center" }}
        />
      </div>
    </>
  );
}

/** El ancho con que se dibuja el botón para que, agrandado, ocupe todo el espacio sin pasarse. */
function buttonWidth(available: number): number {
  return Math.min(GIS_MAX_WIDTH, Math.max(GIS_MIN_WIDTH, Math.floor(available / SCALE)));
}
