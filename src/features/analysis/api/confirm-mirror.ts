import { callBff } from "@/lib/api/client";
import type { ConfirmationAnswer } from "@/features/analysis/api/get-mirror";

export async function confirmMirror(journalEntryId: number, answer: ConfirmationAnswer): Promise<void> {
  await callBff<null>(`/api/v1/journal-entries/${journalEntryId}/confirmation`, {
    method: "POST",
    body: JSON.stringify({ answer }),
  });
}
