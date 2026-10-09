import { callBff } from "@/lib/api/client";

export type RecoverResult = { recoveryCode: string };

export async function recoverAccount(input: {
  code: string;
  recoveryCode: string;
  newPassword: string;
}): Promise<RecoverResult> {
  return callBff<RecoverResult>("/api/auth/recover", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
