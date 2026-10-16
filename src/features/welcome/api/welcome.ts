import { callBff } from "@/lib/api/client";
import type { Gender } from "@/types/gender";

/** CU-17: lo que guardó el estudiante; los textos de las 3 pantallas son del catálogo (messages/es.json). */
export type Welcome = {
  welcomeSeen: boolean;
  startingPoint: string | null;
  startingPointEditable: boolean;
  /** Todavía no dijo cómo quiere que lo llamen ni su sexo: se piden en el primer paso. */
  identityRequired: boolean;
};

export async function getWelcome(): Promise<Welcome> {
  return callBff<Welcome>("/api/v1/welcome");
}

export type WelcomeCompletion = {
  startingPoint: string;
  /** Solo la primera vez (si `identityRequired`); después se cambian desde el perfil. */
  preferredName?: string;
  gender?: Gender;
};

/** CU-17 paso 5: marca la bienvenida como vista; el punto de partida es opcional (4a). */
export async function completeWelcome({ startingPoint, preferredName, gender }: WelcomeCompletion): Promise<void> {
  await callBff<void>("/api/v1/welcome/completion", {
    method: "POST",
    body: JSON.stringify({
      startingPoint: startingPoint.trim() || null,
      ...(preferredName !== undefined && { preferredName: preferredName.trim(), gender }),
    }),
  });
}

/** RN-AC-13: editar el punto de partida desde el perfil, hasta el día 28. */
export async function updateStartingPoint(startingPoint: string): Promise<void> {
  await callBff<void>("/api/v1/profile/starting-point", {
    method: "PUT",
    body: JSON.stringify({ startingPoint: startingPoint.trim() || null }),
  });
}
