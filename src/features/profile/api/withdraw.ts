import { callBff } from "@/lib/api/client";
import type { WithdrawalOption } from "@/features/profile/schemas/profile.schema";

/** CU-21: se confirma con la contraseña o, si la cuenta entra solo con Google, con un ID token de Google. */
export type WithdrawInput = { option: WithdrawalOption } & ({ password: string } | { googleIdToken: string });

export async function withdraw(input: WithdrawInput): Promise<void> {
  await callBff<void>("/api/v1/profile/withdrawal", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
