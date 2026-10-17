import { callBff } from "@/lib/api/client";

export type ActivationResult = { recoveryCode: string };

export async function activateAccount(input: {
  code: string;
  username: string;
  password: string;
}): Promise<ActivationResult> {
  return callBff<ActivationResult>("/api/auth/activate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
