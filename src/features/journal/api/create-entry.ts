import { callBff } from "@/lib/api/client";
import type { JournalContext, JournalFormValues } from "@/features/journal/schemas/journal.schema";

export type CreateJournalEntryResult = {
  journalEntryId: number;
  analysisStatus: "PENDING" | "COMPLETED" | "RISK" | "FAILED";
  mirror: unknown;
};

export async function createJournalEntry(
  values: JournalFormValues,
  idempotencyKey: string,
): Promise<CreateJournalEntryResult> {
  const body: Record<string, unknown> = {
    moodBefore: values.moodBefore,
    mode: values.mode,
  };
  if (values.mode === "GUIDED") {
    body.q1 = values.q1;
    body.q2 = values.q2;
    body.q3 = values.q3;
  } else {
    body.freeText = values.freeText;
  }
  if (values.context) {
    body.context = values.context satisfies JournalContext;
  }

  return callBff<CreateJournalEntryResult>("/api/v1/journal-entries", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  });
}
