"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Script from "next/script";
import { useTheme } from "next-themes";
import { GOOGLE_CLIENT_ID, isGoogleSignInEnabled } from "@/config/public-env";

const GIS_SRC = "https://accounts.google.com/gsi/client";

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
      theme: "outline" | "filled_black";
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
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.accounts),
  );
  const { resolvedTheme } = useTheme();
  const handleCredential = useEffectEvent((response: CredentialResponse) => {
    if (response.credential) {
      onCredential(response.credential);
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    const gis = window.google?.accounts.id;
    if (!scriptReady || !container || !gis) {
      return;
    }
    gis.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => handleCredential(response),
      use_fedcm_for_button: true,
      context: "signin",
    });
    container.replaceChildren();
    gis.renderButton(container, {
      type: "standard",
      theme: resolvedTheme === "dark" ? "filled_black" : "outline",
      size: "large",
      text,
      shape: "pill",
      locale: "es",
      // Google acepta hasta 400 px.
      width: Math.min(400, Math.max(200, Math.round(container.getBoundingClientRect().width))),
    });
  }, [scriptReady, resolvedTheme, text]);

  if (!isGoogleSignInEnabled) {
    return null;
  }

  return (
    <>
      <Script src={GIS_SRC} strategy="afterInteractive" onReady={() => setScriptReady(true)} />
      <div ref={containerRef} className="flex min-h-11 w-full justify-center" />
    </>
  );
}
