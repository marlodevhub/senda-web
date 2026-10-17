import { useSyncExternalStore } from "react";

/**
 * `true` solo en el navegador ya montado. Para lo que solo existe ahí (p. ej. el tema guardado de next-themes):
 * hasta montar no se muestra, y así no hay desajuste de hidratación.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
