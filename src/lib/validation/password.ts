import { z } from "zod";

/**
 * RN-AC-04: la regla de contraseña nueva, una sola vez para activar,
 * recuperar y cambiar contraseña. El servidor la vuelve a validar (y además
 * exige que no sea igual al código); aquí solo evita un viaje de red.
 * Los mensajes son claves de messages/es.json, las traduce `FieldError`.
 */
export const newPasswordSchema = z
  .string()
  .min(8, "validation.passwordTooShort")
  .regex(/[A-Za-z]/, "validation.passwordNeedsLetter")
  .regex(/[0-9]/, "validation.passwordNeedsNumber");

/** Repetir la contraseña: devuelve los argumentos de `.refine`, con el error en el campo de confirmación. */
export function passwordsMatch<T>(
  password: keyof T & string,
  confirmation: keyof T & string,
): [(data: T) => boolean, { message: string; path: string[] }] {
  return [
    (data) => data[password] === data[confirmation],
    { message: "validation.passwordMismatch", path: [confirmation] },
  ];
}
