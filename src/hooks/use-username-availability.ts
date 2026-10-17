"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { callBff } from "@/lib/api/client";
import { normalizeUsername, USERNAME_PATTERN } from "@/lib/validation/username";

/** Pausa al escribir tras la que se consulta: no se pregunta por cada tecla. */
const DEBOUNCE_MS = 500;

export type UsernameAvailabilityState = "idle" | "checking" | "available" | "taken";

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/**
 * CU-15/CU-20: al dejar de escribir, si el usuario está libre u ocupado. `idle` si está vacío, sin formato válido (ese
 * error lo da el formulario) o es el usuario actual (`current`, en el perfil). Orienta, no reserva: el servidor vuelve
 * a comprobarlo al guardar (`USERNAME_TAKEN`).
 */
export function useUsernameAvailability(raw: string, current?: string | null): UsernameAvailabilityState {
  const username = normalizeUsername(raw);
  const debounced = useDebounced(username, DEBOUNCE_MS);
  const checkable = USERNAME_PATTERN.test(debounced) && debounced !== current;

  const { data, isFetching } = useQuery({
    queryKey: ["username-availability", debounced],
    queryFn: () =>
      callBff<{ status: "AVAILABLE" | "TAKEN" | "INVALID" }>(
        `/api/auth/username-availability?username=${encodeURIComponent(debounced)}`,
      ),
    enabled: checkable,
    staleTime: 30_000,
  });

  if (!USERNAME_PATTERN.test(username) || username === current) {
    return "idle";
  }
  // Todavía escribiendo (o esperando la respuesta): no se muestra un resultado viejo.
  if (username !== debounced || isFetching || !data) {
    return "checking";
  }
  return data.status === "AVAILABLE" ? "available" : data.status === "TAKEN" ? "taken" : "idle";
}
