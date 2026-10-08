import { callBff } from "@/lib/api/client";
import type { WithdrawFormValues } from "@/features/profile/schemas/profile.schema";

export async function withdraw(values: WithdrawFormValues): Promise<void> {
  await callBff<void>("/api/v1/profile/withdrawal", {
    method: "POST",
    body: JSON.stringify(values),
  });
}
