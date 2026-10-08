import { callBff } from "@/lib/api/client";

export async function openMessage(messageId: number): Promise<void> {
  await callBff<void>(`/api/v1/messages/${messageId}/opened`, { method: "POST" });
}
