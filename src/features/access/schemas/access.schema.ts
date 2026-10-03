import { z } from "zod";

/**
 * RS-AC-01: el formato real (Luhn mod N sobre un alfabeto de 32 símbolos
 * sin O/0/I/1) lo valida el servidor — esto solo evita un viaje de red
 * por un error de tipeo obvio, nunca es la fuente de verdad.
 */
export const activationCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(1, "Escribe tu código.")
  .regex(/^C\d+-[A-Z0-9]{4}-[A-Z0-9]$/, "Ese código no tiene el formato esperado.");

/** RN-AC-04. */
export const passwordSchema = z
  .string()
  .min(8, "Tu contraseña necesita 8 caracteres o más.")
  .regex(/[A-Za-z]/, "Tu contraseña necesita al menos una letra.")
  .regex(/[0-9]/, "Tu contraseña necesita al menos un número.");

export const activateFormSchema = z
  .object({
    code: activationCodeSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirm"],
  });

export type ActivateFormValues = z.infer<typeof activateFormSchema>;

export const loginFormSchema = z.object({
  code: activationCodeSchema,
  password: z.string().min(1, "Escribe tu contraseña."),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
