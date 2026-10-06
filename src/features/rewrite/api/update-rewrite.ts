import { callBff } from "@/lib/api/client";

export type UpdateRewriteInput = { moodAfter?: number; inJar?: boolean };

export async function updateRewrite(rewriteId: number, input: UpdateRewriteInput): Promise<void> {
  await callBff<null>(`/api/v1/rewrites/${rewriteId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
